import { Link } from "expo-router";
import { Text, View } from "react-native";
export default function App() {

    return(
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text>Finexa App</Text>
            <Link href="/login"><Text>Go to Login</Text></Link>
            <Link href="/signup"><Text>Go to Signup</Text></Link>
        </View>
    )
}
