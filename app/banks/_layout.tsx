// //layout.tsx
// import { Stack } from 'expo-router';

// export default function bankLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="phonepe" />
//       <Stack.Screen name="sbi" />
//       <Stack.Screen name="icici" />
//       <Stack.Screen name="messages" />
//     </Stack>
//   );
// }
import { Stack } from 'expo-router';

export default function BankLayout() {
  return (
    <Stack  screenOptions={{ headerShown: false }} >
      <Stack.Screen 
      name="phonepe" 
      options={{
        presentation: 'transparentModal', // This is key
        animation: 'fade',
        gestureEnabled: true,
        gestureDirection: 'vertical',
        contentStyle: { backgroundColor: 'transparent' }, // Important!
      }}
/>
      <Stack.Screen 
        name="sbi" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen 
        name="icici" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen 
        name="messages" 
        options={{
        }}
      />
    </Stack>
  );
}