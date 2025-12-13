import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useRouter } from "expo-router";
import { Alert } from "react-native";


export default function Login() {
  type FormErrors = {
  username?: string;
  password?: string;
};

  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validateform=()=>{
    let errors: FormErrors = {};

    if(username==="") errors.username="username is required";
    if(password==="") errors.password="password is required";
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
    // Same logic as signup
    const email = `${username}@finexa.com`;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("User logged in:", userCredential.user.uid);

    Alert.alert("Success", "Login successful");

    // Reset form
    setUsername("");
    setPassword("");
    setErrors({});

    // Navigate to home/dashboard
   router.replace("/tabs/home");

  } catch (error: any) {
    console.log(error.message);
    Alert.alert("Login failed", "Invalid username or password");
  }
};
  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.sav}>
          <View style={styles.c1}>
            <Text style={styles.ht}>Welcome Back</Text>
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
          </View>
          
          <View style={styles.c3} >
            
               
               <Pressable style={styles.button} onPress={submit}>
                  <Text style={styles.btn}>Login</Text>
                </Pressable>
          </View>
          
          <View  style={styles.c4}>
            <Text>___________ or continue with ____________</Text>
            <Pressable style={styles.button}>
                  <Text style={styles.btn}>Google</Text>
                </Pressable>
            <Text>doesn't have an account?<Link href="/signup"><Text style={{ color: 'blue' }}>sign up</Text> </Link></Text>
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
});