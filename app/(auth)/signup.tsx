import Checkbox from 'expo-checkbox';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { useEffect } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";



export default function Signup() {

  

  type FormErrors = {
  username?: string;
  password?: string;
  cpassword?: string;
  tos?: string;
};

  const [isChecked, setChecked] = useState(false);
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [cpassword,setCpassword]=useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validateform=()=>{
    let errors: FormErrors = {};

    if(username==="") errors.username="username is required";
    if(password==="") errors.password="password is required";
    if(cpassword==="") errors.cpassword="please re enter your password ";
     if (password && cpassword && password !== cpassword) {
      errors.cpassword = "Passwords do not match";
    }
    if(!isChecked) errors.tos="you must agree to the terms and conditions"; 
    setErrors(errors);
    return Object.keys(errors).length===0;

  }
  

    
  const router = useRouter();
 const submit = async () => {
  if (!validateform()) {
    console.log("details are not correct");
    return;
  }

  try {
    const email = `${username}@finexa.com`;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      createdAt: serverTimestamp(),
    });

    console.log("User created:", user.uid);
    console.log("User saved to Firestore");

    Alert.alert("Success", "Account created successfully");

    // Reset form
    setUsername("");
    setPassword("");
    setCpassword("");
    setErrors({});
    setChecked(false);

    // inside submit() after success
   router.replace("../tabs");



  } catch (error: any) {
    console.log(error.message);
    Alert.alert("Signup failed", error.message);
  }
};

  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.sav}>
          <View style={styles.c1}>
            <Text style={styles.ht}>Create Account</Text>
            <Text style={styles.Text}>Know Your Habits. Master Your Money</Text>
          </View> 
          <View style={styles.c2}>
                <View style={styles.cmp}>
                  <Text style={styles.Text}>Username</Text>
                <TextInput placeholder="john123" style={styles.ti} value={username} onChangeText={setUsername} autoCapitalize="none"
/>
               
                </View>
                {errors.username && <Text style={{ color: 'red' }}>{errors.username}</Text>}

                <View style={styles.cmp}>
                  <Text style={styles.Text}>Password</Text>
                  <TextInput placeholder="********" secureTextEntry={true} style={styles.ti} value={password} onChangeText={setPassword} autoCapitalize="none"/>
                </View>
                {errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}
                <View style={styles.cmp}>
                  <Text style={styles.Text}>Confirm Password</Text>
                  <TextInput placeholder="********" secureTextEntry={true} style={styles.ti} value={cpassword} onChangeText={setCpassword} autoCapitalize="none"/>
                </View>   
                {errors.cpassword && <Text style={{ color: 'red' }}>{errors.cpassword}</Text>}
          </View>
          
          <View style={styles.c3} >
               <View style={styles.Checkbox}>
                    <Checkbox
                      value={isChecked}
                      onValueChange={setChecked}
                      color={isChecked ? '#4630EB' : undefined}
                    />
                    <Text style={{ marginLeft: 10 }}>I agree to the Terms of Service and <Link href="/privacypolicy"><Text style={{ color: 'blue' }}>Privacy Policy</Text></Link></Text>
               </View>
               {errors.tos && <Text style={{ color: 'red' }}>{errors.tos}</Text>}
               <Pressable style={styles.button} onPress={submit}>
                  <Text style={styles.btn}>Sign Up</Text>
                </Pressable>
          </View>
          
          <View  style={styles.c4}>
            <Text>___________ or continue with ____________</Text>
            <Pressable style={styles.button}>
                  <Text style={styles.btn}>Google</Text>
                </Pressable>
            <Text>already have an account?<Link href="/login"><Text style={{ color: 'blue' }}>Log in</Text> </Link></Text>
          </View>

        </SafeAreaView>
    </View>
  )
}
  const styles = StyleSheet.create({
    container: {
      flex: 1, 
    },
    sav: { 
      flex: 1 ,
      backgroundColor:'violet',
      gap:20,
     },
     c1:{
      flex:1,
      justifyContent:"center",
      alignItems:"center",

     },
     c2:{
       flex:2,
       alignItems:"flex-start",
       marginLeft:"10%",
     },
     c3:{
       flex:1,
       alignItems:"center",
     },
     c4:{
       flex:1,
       alignItems:"center",
     },
    ti:{
      borderRadius:15,
      borderWidth:1,
      borderColor:'white',
      padding:12,
      marginBottom:16,
      width:"88%",
    },
    Text:{
      color:'white',
      fontSize:15,
    },
    ht:{
      color:'white',
      fontSize:25,
    },
    bdy:{
      flex:5,
      gap:10,
      alignItems:"flex-start",
      paddingLeft:"10%",
    },
    cmp:{
      flex:1,
      width:"100%",
      gap:5,  
    },
    btn:{
      backgroundColor:'white',
      color:'black',
      padding:15,
      borderRadius:30,
      textAlign:'center',
      fontSize:18,
      fontWeight:'bold',
      width:"100%",
      
    },
    button:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      width:"80%",
    },
    Checkbox:{
      flexDirection: "row", alignItems: "center"
    }
});