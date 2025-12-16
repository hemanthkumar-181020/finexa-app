import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  
  
  const barsOpacity = useRef(new Animated.Value(1)).current;
  const barsClipHeight = useRef(new Animated.Value(0)).current;
  
  
  const sunOpacity = useRef(new Animated.Value(1)).current;
  const sunClipHeight = useRef(new Animated.Value(0)).current;
  
  
  const arrowOpacity = useRef(new Animated.Value(1)).current;
  const arrowClipWidth = useRef(new Animated.Value(0)).current;
  
  
  const loadingBarOpacity = useRef(new Animated.Value(0)).current;
  const infiniteBarPosition = useRef(new Animated.Value(0)).current;
  
  
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  
  
  const letterF = useRef(new Animated.ValueXY({ x: -250, y: -250 })).current;
  const letterI = useRef(new Animated.ValueXY({ x: 250, y: -250 })).current;
  const letterN = useRef(new Animated.ValueXY({ x: -250, y: 250 })).current;
  const letterE = useRef(new Animated.ValueXY({ x: 250, y: 250 })).current;
  const letterX = useRef(new Animated.ValueXY({ x: -250, y: 0 })).current;
  const letterA = useRef(new Animated.ValueXY({ x: 250, y: 0 })).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(60)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      
      Animated.delay(300),
      
      
      Animated.timing(barsClipHeight, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
      
      
      Animated.delay(300),
      
     
      Animated.timing(sunClipHeight, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: false,
      }),
      
      
      Animated.delay(400),
      
      
      Animated.timing(arrowClipWidth, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
      
      
      Animated.delay(700),
      
      
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: -height * 0.25,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      
      Animated.delay(200),
      
      Animated.timing(loadingBarOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      
      
      Animated.delay(400),
      
      
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(letterF, {
          toValue: { x: 0, y: 0 },
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(letterI, {
          toValue: { x: 0, y: 0 },
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(letterN, {
          toValue: { x: 0, y: 0 },
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(letterE, {
          toValue: { x: 0, y: 0 },
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(letterX, {
          toValue: { x: 0, y: 0 },
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(letterA, {
          toValue: { x: 0, y: 0 },
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      
      Animated.delay(400),
      
      
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    
    const startInfiniteAnimation = () => {
      infiniteBarPosition.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(infiniteBarPosition, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(infiniteBarPosition, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    
    setTimeout(startInfiniteAnimation, 5000);
  }, []);

  const handleGetStarted = () => {
    router.replace('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.gradientOverlay} />
      
      
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Animated.Text
          style={[
            styles.letter,
            { transform: [{ translateX: letterF.x }, { translateY: letterF.y }] }
          ]}
        >
          F
        </Animated.Text>
        <Animated.Text
          style={[
            styles.letter,
            { transform: [{ translateX: letterI.x }, { translateY: letterI.y }] }
          ]}
        >
          I
        </Animated.Text>
        <Animated.Text
          style={[
            styles.letter,
            { transform: [{ translateX: letterN.x }, { translateY: letterN.y }] }
          ]}
        >
          N
        </Animated.Text>
        <Animated.Text
          style={[
            styles.letter,
            { transform: [{ translateX: letterE.x }, { translateY: letterE.y }] }
          ]}
        >
          E
        </Animated.Text>
        <Animated.Text
          style={[
            styles.letter,
            { transform: [{ translateX: letterX.x }, { translateY: letterX.y }] }
          ]}
        >
          X
        </Animated.Text>
        <Animated.Text
          style={[
            styles.letter,
            { transform: [{ translateX: letterA.x }, { translateY: letterA.y }] }
          ]}
        >
          A
        </Animated.Text>
      </Animated.View>

      
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: logoScale },
              { translateY: logoTranslateY }
            ],
          },
        ]}
      >
        {/* Sun - REVEALS from bottom to top */}
        <View style={styles.sunWrapper}>
          <Animated.View
            style={[
              styles.sunClipContainer,
              {
                height: sunClipHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <Image
              source={require('../assets/images/sun.png')}
              style={styles.sunImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        
        <View style={styles.barsWrapper}>
          <Animated.View
            style={[
              styles.barsClipContainer,
              {
                height: barsClipHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <Image
              source={require('../assets/images/bars.png')}
              style={styles.barsImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        
        <View style={styles.arrowWrapper}>
          <Animated.View
            style={[
              styles.arrowClipContainer,
              {
                width: arrowClipWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <Image
              source={require('../assets/images/arrow.png')}
              style={styles.arrowImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Loading Bar - Below logo */}
        <Animated.View style={[styles.loadingBarContainer, { opacity: loadingBarOpacity }]}>
          <View style={styles.loadingBarBackground}>
            <Animated.View
              style={[
                styles.loadingBarFill,
                {
                  transform: [{
                    translateX: infiniteBarPosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 300],
                    }),
                  }],
                },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonOpacity,
            transform: [
              { translateY: buttonTranslateY },
              { scale: buttonScale }
            ],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <View style={styles.buttonGlow} />
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          Smart expense tracking that learns from your spending
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00082f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  textContainer: {
    position: 'absolute',
    top: height * 0.1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  letter: {
    fontSize: 52,
    fontWeight: '900',
    color: '#83cfcb',
    marginHorizontal: 1,
    textShadowColor: 'rgba(131, 207, 203, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.85,
    height: height * 0.5,
    position: 'relative',
  },
  
  
  sunWrapper: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: '20%',
    left: '50%',
    marginLeft: -100,
    zIndex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sunClipContainer: {
    width: 200,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sunImage: {
    width: 200,
    height: 200,
    position: 'absolute',
    bottom: 0,
  },
  
  
  barsWrapper: {
    position: 'absolute',
    width: 280,
    height: 220,
    bottom: '28%',
    left: '50%',
    marginLeft: -140,
    zIndex: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barsClipContainer: {
    width: 280,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barsImage: {
    width: 280,
    height: 220,
    position: 'absolute',
    bottom: 0,
  },
  
  arrowWrapper: {
    position: 'absolute',
    width: 290,
    height: 300,
    top: '10%',
    left: '68%',
    marginLeft: -180,
    zIndex: 2,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  arrowClipContainer: {
    height: 320,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  arrowImage: {
    width: 250,
    height: 320,
    position: 'absolute',
    left: 0,
  },
  
  // LOADING BAR STYLING
  loadingBarContainer: {
    position: 'absolute',
    bottom: '10%',
    width: 260,
    alignItems: 'center',
    zIndex: 4,
  },
  loadingBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(1, 69, 142, 0.4)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(131, 207, 203, 0.3)',
  },
  loadingBarFill: {
    position: 'absolute',
    width: 100,
    height: '100%',
    backgroundColor: '#83cfcb',
    borderRadius: 4,
    shadowColor: '#83cfcb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  
  
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.08,
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  button: {
    backgroundColor: '#83cfcb',
    paddingVertical: 20,
    paddingHorizontal: 70,
    borderRadius: 35,
    shadowColor: '#83cfcb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(131, 207, 203, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
  },
  buttonText: {
    color: '#00082f',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 24,
    color: '#83cfcb',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.85,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
});

//track your expenses version 1
// import React, { useEffect, useRef } from 'react';
// import { View, StyleSheet, Animated, Text, TouchableOpacity, Dimensions } from 'react-native';
// import { useRouter } from 'expo-router';

// const { width, height } = Dimensions.get('window');

// export default function Splash() {
//   const router = useRouter();
  
//   // Main text animations
//   const textOpacity = useRef(new Animated.Value(0)).current;
//   const textScale = useRef(new Animated.Value(0.8)).current;
  
//   // Central UPI Wallet animation (starts at center)
//   const walletScale = useRef(new Animated.Value(1.5)).current;
//   const walletOpacity = useRef(new Animated.Value(1)).current;
//   const walletX = useRef(new Animated.Value(0)).current;
//   const walletY = useRef(new Animated.Value(0)).current;
  
//   // Coins animation (start from center, splash out)
//   const coin1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
//   const coin1Scale = useRef(new Animated.Value(1)).current;
//   const coin1Opacity = useRef(new Animated.Value(1)).current;
  
//   const coin2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
//   const coin2Scale = useRef(new Animated.Value(1)).current;
//   const coin2Opacity = useRef(new Animated.Value(1)).current;
  
//   const coin3 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
//   const coin3Scale = useRef(new Animated.Value(1)).current;
//   const coin3Opacity = useRef(new Animated.Value(1)).current;
  
//   const coin4 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
//   const coin4Scale = useRef(new Animated.Value(1)).current;
//   const coin4Opacity = useRef(new Animated.Value(1)).current;
  
//   // Category icons (appear after coins reach them)
//   const icon1Scale = useRef(new Animated.Value(0)).current; // Chart
//   const icon2Scale = useRef(new Animated.Value(0)).current; // Card
//   const icon3Scale = useRef(new Animated.Value(0)).current; // Dollar
//   const icon4Scale = useRef(new Animated.Value(0)).current; // Piggy
  
//   // Hand animation (emerges first)
//   const handOpacity = useRef(new Animated.Value(0)).current;
//   const handTranslateY = useRef(new Animated.Value(100)).current;
//   const handScale = useRef(new Animated.Value(0.5)).current;
  
//   // Ticket animation (appears in hand after)
//   const ticketOpacity = useRef(new Animated.Value(0)).current;
//   const ticketScale = useRef(new Animated.Value(0)).current;
//   const ticketRotate = useRef(new Animated.Value(0)).current;
  
//   // Button animation
//   const buttonOpacity = useRef(new Animated.Value(0)).current;
//   const buttonTranslateY = useRef(new Animated.Value(50)).current;

//   useEffect(() => {
//     Animated.sequence([
//       Animated.delay(300),
      
//       // Step 1: Text appears
//       Animated.parallel([
//         Animated.timing(textOpacity, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//         Animated.spring(textScale, {
//           toValue: 1,
//           tension: 50,
//           friction: 7,
//           useNativeDriver: true,
//         }),
//       ]),
      
//       Animated.delay(500),
      
//       // Step 2: UPI Wallet zooms out and coins splash to different positions
//       Animated.parallel([
//         // Wallet moves to top-right and shrinks
//         Animated.timing(walletX, {
//           toValue: width * 0.25,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(walletY, {
//           toValue: -height * 0.15,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(walletScale, {
//           toValue: 0.6,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
        
//         // Coin 1 splashes to top-left
//         Animated.timing(coin1.x, {
//           toValue: -width * 0.35,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin1.y, {
//           toValue: -height * 0.2,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin1Scale, {
//           toValue: 0.8,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
        
//         // Coin 2 splashes to middle-left
//         Animated.timing(coin2.x, {
//           toValue: -width * 0.4,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin2.y, {
//           toValue: -height * 0.02,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin2Scale, {
//           toValue: 0.8,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
        
//         // Coin 3 splashes to middle-right
//         Animated.timing(coin3.x, {
//           toValue: width * 0.35,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin3.y, {
//           toValue: height * 0.05,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin3Scale, {
//           toValue: 0.8,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
        
//         // Coin 4 splashes to bottom-left
//         Animated.timing(coin4.x, {
//           toValue: -width * 0.3,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin4.y, {
//           toValue: height * 0.18,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin4Scale, {
//           toValue: 0.8,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ]),
      
//       Animated.delay(200),
      
//       // Step 3: Category icons pop up where coins landed
//       Animated.parallel([
//         Animated.spring(icon1Scale, {
//           toValue: 1,
//           tension: 100,
//           friction: 5,
//           useNativeDriver: true,
//         }),
//         Animated.spring(icon2Scale, {
//           toValue: 1,
//           tension: 100,
//           friction: 5,
//           useNativeDriver: true,
//         }),
//         Animated.spring(icon3Scale, {
//           toValue: 1,
//           tension: 100,
//           friction: 5,
//           useNativeDriver: true,
//         }),
//         Animated.spring(icon4Scale, {
//           toValue: 1,
//           tension: 100,
//           friction: 5,
//           useNativeDriver: true,
//         }),
//         // Fade out coins
//         Animated.timing(coin1Opacity, {
//           toValue: 0,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin2Opacity, {
//           toValue: 0,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin3Opacity, {
//           toValue: 0,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coin4Opacity, {
//           toValue: 0,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//       ]),
      
//       Animated.delay(300),
      
//       // Step 4: Hand emerges from bottom
//       Animated.parallel([
//         Animated.timing(handOpacity, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//         Animated.spring(handTranslateY, {
//           toValue: 0,
//           tension: 80,
//           friction: 8,
//           useNativeDriver: true,
//         }),
//         Animated.spring(handScale, {
//           toValue: 1,
//           tension: 80,
//           friction: 8,
//           useNativeDriver: true,
//         }),
//       ]),
      
//       Animated.delay(400),
      
//       // Step 5: Ticket appears in hand
//       Animated.parallel([
//         Animated.timing(ticketOpacity, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//         Animated.spring(ticketScale, {
//           toValue: 1,
//           tension: 80,
//           friction: 6,
//           useNativeDriver: true,
//         }),
//         Animated.timing(ticketRotate, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//       ]),
      
//       Animated.delay(600),
      
//       // Step 6: Button appears
//       Animated.parallel([
//         Animated.timing(buttonOpacity, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//         Animated.spring(buttonTranslateY, {
//           toValue: 0,
//           tension: 60,
//           friction: 8,
//           useNativeDriver: true,
//         }),
//       ]),
//     ]).start();
//   }, []);

//   const handleGetStarted = () => {
//     // Navigate to next screen
//     // router.push('/home');
//   };

//   return (
//     <View style={styles.container}>
//       {/* Main Content Area */}
//       <View style={styles.contentContainer}>
        
//         {/* Main Text */}
//         <Animated.View
//           style={[
//             styles.textContainer,
//             {
//               opacity: textOpacity,
//               transform: [{ scale: textScale }],
//             },
//           ]}
//         >
//           <Text style={styles.mainText}>Track</Text>
//           <Text style={styles.mainText}>your</Text>
//           <Text style={styles.mainText}>Expenses</Text>
//         </Animated.View>

//         {/* UPI Wallet - starts at center, moves to top-right */}
//         <Animated.View
//           style={[
//             styles.walletContainer,
//             {
//               opacity: walletOpacity,
//               transform: [
//                 { translateX: walletX },
//                 { translateY: walletY },
//                 { scale: walletScale },
//               ],
//             },
//           ]}
//         >
//           <View style={styles.wallet}>
//             <Text style={styles.walletText}>💳</Text>
//           </View>
//         </Animated.View>

//         {/* Coins - start from center, splash out */}
//         <Animated.View
//           style={[
//             styles.coinContainer,
//             {
//               opacity: coin1Opacity,
//               transform: [
//                 { translateX: coin1.x },
//                 { translateY: coin1.y },
//                 { scale: coin1Scale },
//               ],
//             },
//           ]}
//         >
//           <Text style={styles.coinText}>🪙</Text>
//         </Animated.View>

//         <Animated.View
//           style={[
//             styles.coinContainer,
//             {
//               opacity: coin2Opacity,
//               transform: [
//                 { translateX: coin2.x },
//                 { translateY: coin2.y },
//                 { scale: coin2Scale },
//               ],
//             },
//           ]}
//         >
//           <Text style={styles.coinText}>🪙</Text>
//         </Animated.View>

//         <Animated.View
//           style={[
//             styles.coinContainer,
//             {
//               opacity: coin3Opacity,
//               transform: [
//                 { translateX: coin3.x },
//                 { translateY: coin3.y },
//                 { scale: coin3Scale },
//               ],
//             },
//           ]}
//         >
//           <Text style={styles.coinText}>🪙</Text>
//         </Animated.View>

//         <Animated.View
//           style={[
//             styles.coinContainer,
//             {
//               opacity: coin4Opacity,
//               transform: [
//                 { translateX: coin4.x },
//                 { translateY: coin4.y },
//                 { scale: coin4Scale },
//               ],
//             },
//           ]}
//         >
//           <Text style={styles.coinText}>🪙</Text>
//         </Animated.View>

//         {/* Category Icons - appear where coins land */}
//         <Animated.View
//           style={[
//             styles.iconContainer,
//             styles.icon1Position,
//             { transform: [{ scale: icon1Scale }] },
//           ]}
//         >
//           {/* <View style={[styles.icon, styles.chartIcon]}>
//             <Text style={styles.iconText}>📊</Text>
//           </View> */}
//         </Animated.View>

//         <Animated.View
//           style={[
//             styles.iconContainer,
//             styles.icon2Position,
//             { transform: [{ scale: icon2Scale }] },
//           ]}
//         >
//           <View style={[styles.icon, styles.dollarIcon]}>
//             <Text style={styles.iconText}>🚌</Text>
//           </View>
//         </Animated.View>

//         <Animated.View
//           style={[
//             styles.iconContainer,
//             styles.icon3Position,
//             { transform: [{ scale: icon3Scale }] },
//           ]}
//         >
//           <View style={[styles.icon, styles.cardIcon]}>
//             <Text style={styles.iconText}>☕</Text>
//           </View>
//         </Animated.View>

//         <Animated.View
//           style={[
//             styles.iconContainer,
//             styles.icon4Position,
//             { transform: [{ scale: icon4Scale }] },
//           ]}
//         >
//           <View style={[styles.icon, styles.piggyIcon]}>
//             <Text style={styles.iconText}>🚅</Text>
//           </View>
//         </Animated.View>

//         {/* Hand - emerges from bottom */}
//         <Animated.View
//           style={[
//             styles.handContainer,
//             {
//               opacity: handOpacity,
//               transform: [
//                 { translateY: handTranslateY },
//                 { scale: handScale },
//               ],
//             },
//           ]}
//         >
//           {/* <Text style={styles.handEmoji}></Text> */}
          
//           {/* Ticket - appears in hand */}
//           <Animated.View
//             style={[
//               styles.ticketContainer,
//               {
//                 opacity: ticketOpacity,
//                 transform: [
//                   { scale: ticketScale },
//                   {
//                     rotate: ticketRotate.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: ['15deg', '0deg'],
//                     }),
//                   },
//                 ],
//               },
//             ]}
//           >
//             {/* <View style={styles.ticket}>
//               <Text style={styles.ticketText}>🎫</Text>
//             </View> */}
//           </Animated.View>
//         </Animated.View>

//       </View>

//       {/* Get Started Button */}
//       <Animated.View
//         style={[
//           styles.buttonContainer,
//           {
//             opacity: buttonOpacity,
//             transform: [{ translateY: buttonTranslateY }],
//           },
//         ]}
//       >
        
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0066FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   contentContainer: {
//     width: width * 0.9,
//     height: height * 0.7,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   textContainer: {
//     alignItems: 'center',
//     zIndex: 5,
//   },
//   mainText: {
//     fontSize: 72,
//     fontWeight: '900',
//     color: '#FFFFFF',
//     textAlign: 'center',
//     lineHeight: 80,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 2, height: 2 },
//     textShadowRadius: 8,
//   },
  
//   // Wallet (starts at center)
//   walletContainer: {
//     position: 'absolute',
//     zIndex: 15,
//   },
//   wallet: {
//     width: 100,
//     height: 100,
//     borderRadius: 25,
//     backgroundColor: '#FFA500',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   walletText: {
//     fontSize: 50,
//   },
  
//   // Coins (start from center)
//   coinContainer: {
//     position: 'absolute',
//     zIndex: 14,
//   },
//   coinText: {
//     fontSize: 50,
//   },
  
//   // Category Icons
//   iconContainer: {
//     position: 'absolute',
//     zIndex: 10,
//   },
//   icon: {
//     width: 80,
//     height: 80,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   iconText: {
//     fontSize: 40,
//   },
  
//   // Icon Positions (where coins land)
//   icon1Position: {
//     top: 20,
//     left: 20,
//   },
//   icon2Position: {
//     top: '38%',
//     left: 0,
//   },
//   icon3Position: {
//     top: '42%',
//     right: 10,
//   },
//   icon4Position: {
//     bottom: 100,
//     left: 30,
//   },
  
//   // Icon Colors
//   chartIcon: {
//     backgroundColor: '#FF6B9D',
//   },
//   dollarIcon: {
//     backgroundColor: '#00D4AA',
//   },
//   cardIcon: {
//     backgroundColor: '#FFD700',
//   },
//   piggyIcon: {
//     backgroundColor: '#FF69B4',
//   },
  
//   // Hand
//   handContainer: {
//     position: 'absolute',
//     bottom: 80,
//     right: 40,
//     zIndex: 20,
//     alignItems: 'center',
//   },
//   handEmoji: {
//     fontSize: 120,
//     transform: [{ rotate: '-15deg' }],
//   },
  
//   // Ticket (appears in hand)
//   ticketContainer: {
//     position: 'absolute',
//     top: -20,
//     right: -10,
//     zIndex: 21,
//   },
//   ticket: {
//     width: 70,
//     height: 70,
//     borderRadius: 15,
//     backgroundColor: '#FFD700',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   ticketText: {
//     fontSize: 40,
//   },
  
//   // Button Styling
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 40,
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   button: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 18,
//     paddingHorizontal: 60,
//     borderRadius: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   buttonText: {
//     color: '#0066FF',
//     fontSize: 20,
//     fontWeight: '800',
//     letterSpacing: 1,
//   },
//   subtitle: {
//     marginTop: 20,
//     color: '#FFFFFF',
//     fontSize: 15,
//     textAlign: 'center',
//     opacity: 0.9,
//     fontWeight: '500',
//   },
// });


//  track your expenses version 2
// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
// import Animated, { 
//   useSharedValue, 
//   useAnimatedStyle, 
//   withSpring, 
//   withTiming, 
//   SharedValue,
//   withDelay, 
//   withSequence,
//   withRepeat,
//   Easing,
//   interpolate,
//   Extrapolation
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';

// const { width, height } = Dimensions.get('window');

// // --- CONSTANTS FOR LAYOUT ---
// // This ensures nothing overlaps. We calculate based on screen size.
// const CENTER_Y = height * 0.4; // Slightly above center
// const ORBIT_RADIUS = width * 0.38; // How far icons float from center
// const progress: SharedValue<number> = useSharedValue(0);

// export default function HighEndSplash() {
//   const router = useRouter();

//   // --- ANIMATION VALUES ---
//   const mainProgress = useSharedValue(0); // Controls the sequence 0 -> 1
//   const cardRotation = useSharedValue(0); // 3D spin
//   const buttonY = useSharedValue(100);    // Button slide up
  
//   // Floating Animations (Breathing effect)
//   const float1 = useSharedValue(0);
//   const float2 = useSharedValue(0);
//   const float3 = useSharedValue(0);
//   const float4 = useSharedValue(0);

//   useEffect(() => {
//     // 1. Start the Sequence
//     mainProgress.value = withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

//     // 2. Spin the credit card
//     cardRotation.value = withDelay(300, withSpring(1, { damping: 12 }));

//     // 3. Float the button up
//     buttonY.value = withDelay(1400, withSpring(0, { damping: 15 }));

//     // 4. Start infinite breathing for icons after they appear
//     const floatConfig = { duration: 20000, easing: Easing.inOut(Easing.quad) };
//     setTimeout(() => {
//       float2.value = withRepeat(withDelay(500, withTiming(10, floatConfig)), -1, true);
//       float2.value = withRepeat(withDelay(500, withTiming(10, floatConfig)), -1, true);
//       float3.value = withRepeat(withDelay(200, withTiming(10, floatConfig)), -1, true);
//       float4.value = withRepeat(withDelay(700, withTiming(10, floatConfig)), -1, true);
//     }, 1200);

//   }, []);

//   // --- STYLES ---

//   // 1. Text Animation (Fade + Scale Up)
//   const textStyle = useAnimatedStyle(() => ({
//     opacity: interpolate(mainProgress.value, [0, 0.4], [0, 1]),
//     transform: [
//       { scale: interpolate(mainProgress.value, [0, 0.4], [0.5, 1], Extrapolation.CLAMP) }
//     ]
//   }));

//   // 2. Card 3D Animation
//   const cardStyle = useAnimatedStyle(() => ({
//     transform: [
//       { perspective: 1000 },
//       { rotateY: `${interpolate(cardRotation.value, [0, 1], [90, 0])}deg` },
//       { scale: interpolate(cardRotation.value, [0, 1], [0.5, 1]) }
//     ],
//     opacity: cardRotation.value // Fade in while spinning
//   }));

//   // 3. Icons: They start at center, move to corners, then float
//   const createIconStyle = (angleDeg: number, floatVal: SharedValue<number>) => useAnimatedStyle(() => {
//     // Calculate final X/Y based on angle (Polar coordinates)
//     const rad = (angleDeg * Math.PI) / 180;
//     const finalX = Math.cos(rad) * ORBIT_RADIUS;
//     const finalY = Math.sin(rad) * ORBIT_RADIUS;

//     // Animate from Center (0,0) to Final (finalX, finalY) based on progress
//     // Trigger happens between 0.4 and 0.8 of main timeline
//     const expansion = interpolate(mainProgress.value, [0.4, 1], [0, 1], Extrapolation.CLAMP);
    
//     return {
//       opacity: interpolate(mainProgress.value, [0.4, 0.6], [0, 1]),
//       transform: [
//         { translateX: expansion * finalX }, // Move Out
//         { translateY: (expansion * finalY) + floatVal.value }, // Move Out + Float Up/Down
//         { scale: expansion } // Scale up from 0
//       ]
//     };
//   });

//   // Assign quadrants to avoid overlap
//   const icon1Style = createIconStyle(225, float1); // Top Left
//   const icon2Style = createIconStyle(315, float2); // Top Right
//   const icon3Style = createIconStyle(135, float3); // Bottom Left
//   const icon4Style = createIconStyle(45, float4);  // Bottom Right

//   // 4. Coin Burst (Particle Effect)
//   const createCoinStyle = (angleDeg: number, delay: number) => useAnimatedStyle(() => {
//     // Coins shoot further out then fade
//     const rad = (angleDeg * Math.PI) / 180;
//     const burstRadius = ORBIT_RADIUS * 1.2; 
    
//     // Only animate during the "Burst" phase (0.3 to 0.7)
//     const progress = interpolate(mainProgress.value, [0.3, 0.8], [0, 1], Extrapolation.CLAMP);
//     const opacity = interpolate(mainProgress.value, [0.6, 0.9], [1, 0]); // Fade out at end

//     return {
//       opacity: opacity,
//       transform: [
//         { translateX: progress * (Math.cos(rad) * burstRadius) },
//         { translateY: progress * (Math.sin(rad) * burstRadius) },
//         { scale: interpolate(progress, [0, 0.5], [0, 1.2]) },
//         { rotate: `${progress * 720}deg` } // Spin wildy
//       ]
//     };
//   });

//   const buttonStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: buttonY.value }],
//     opacity: interpolate(buttonY.value, [100, 0], [0, 1])
//   }));

//   return (
//     <LinearGradient
//       colors={['#0F2027', '#203A43', '#2C5364']} // High-end Dark Theme Gradient
//       style={styles.container}
//     >
//       <View style={styles.centerContainer}>

//         {/* --- LAYER 1: PARTICLES (Background Burst) --- */}
//         {[0, 72, 144, 216, 288].map((angle, i) => (
//           <Animated.View key={i} style={[styles.coinWrapper, createCoinStyle(angle, i)]}>
//              <View style={styles.coin}><Text style={styles.coinText}>₹</Text></View>
//           </Animated.View>
//         ))}

//         {/* --- LAYER 2: ORBITING ICONS (The Categories) --- */}
//         {/* Top Left */}
//         <Animated.View style={[styles.iconWrapper, icon1Style]}>
//           <View style={[styles.iconCard, { backgroundColor: '#6C5CE7' }]}>
//             <Text style={styles.iconEmoji}>🚌</Text>
//             <Text style={styles.iconLabel}>Travel</Text>
//           </View>
//         </Animated.View>

//         {/* Top Right */}
//         <Animated.View style={[styles.iconWrapper, icon2Style]}>
//           <View style={[styles.iconCard, { backgroundColor: '#00B894' }]}>
//             <Text style={styles.iconEmoji}>🛍️</Text>
//             <Text style={styles.iconLabel}>Shop</Text>
//           </View>
//         </Animated.View>

//         {/* Bottom Left */}
//         <Animated.View style={[styles.iconWrapper, icon3Style]}>
//           <View style={[styles.iconCard, { backgroundColor: '#E17055' }]}>
//             <Text style={styles.iconEmoji}>🍔</Text>
//             <Text style={styles.iconLabel}>Food</Text>
//           </View>
//         </Animated.View>

//         {/* Bottom Right */}
//         <Animated.View style={[styles.iconWrapper, icon4Style]}>
//           <View style={[styles.iconCard, { backgroundColor: '#0984E3' }]}>
//             <Text style={styles.iconEmoji}>🎬</Text>
//             <Text style={styles.iconLabel}>Entertainment</Text>
//           </View>
//         </Animated.View>

//         {/* --- LAYER 3: MAIN TEXT & CARD (Center Stage) --- */}
//         <Animated.View style={[styles.titleWrapper, textStyle]}>
//           <Text style={styles.titleText}>Track</Text>
//           <View style={styles.row}>
//              {/* 3D Card Flip */}
//             <Animated.View style={cardStyle}>
//               <View style={styles.creditCard}>
//                 <View style={styles.chip} />
//                 <View style={styles.strip} />
//               </View>
//             </Animated.View>
//             <Text style={styles.titleText}>your</Text>
//           </View>
//           <Text style={styles.titleText}>Expenses</Text>
//         </Animated.View>

//       </View>

//       {/* --- LAYER 4: BOTTOM BUTTON --- */}
//       {/* <Animated.View style={[styles.bottomContainer, buttonStyle]}>
//         <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={() => router.push('/signup')}>
//           <Text style={styles.buttonText}>Get Started</Text>
//         </TouchableOpacity>
//         <Text style={styles.footerText}>Smart AI powered tracking</Text>
//       </Animated.View> */}
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centerContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // We set a fixed height context for our radial math
//     marginTop: -50, 
//   },
  
//   // --- MAIN TITLE ---
//   titleWrapper: {
//     alignItems: 'center',
//     zIndex: 10, // Ensure text is above orbit items if they get close
//   },
//   titleText: {
//     fontSize: 52,
//     fontWeight: '900',
//     color: '#FFF',
//     lineHeight: 58,
//     textShadowColor: 'rgba(0,0,0,0.3)',
//     textShadowOffset: { width: 0, height: 4 },
//     textShadowRadius: 10,
//     letterSpacing: -1,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//   },

//   // --- 3D CARD ---
//   creditCard: {
//     width: 90,
//     height: 60,
//     backgroundColor: '#1E1E1E', // Dark high-end card
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     padding: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.5,
//     shadowRadius: 15,
//     elevation: 10,
//   },
//   chip: {
//     width: 18,
//     height: 14,
//     backgroundColor: '#FFD700',
//     borderRadius: 4,
//     marginBottom: 5,
//   },
//   strip: {
//     width: 30,
//     height: 4,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 2,
//   },

//   // --- ORBITING ICONS ---
//   iconWrapper: {
//     position: 'absolute', // Absolute relative to centerContainer
//     // No top/left here, we handle it via transform translate in Reanimated
//   },
//   iconCard: {
//     width: 80,
//     height: 80,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.15)', // Glass effect border
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//   },
//   iconEmoji: {
//     fontSize: 32,
//     marginBottom: 4,
//   },
//   iconLabel: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '700',
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//   },

//   // --- COINS ---
//   coinWrapper: {
//     position: 'absolute',
//     zIndex: 0, // Behind everything
//   },
//   coin: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#FFD700',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#FFA500',
//   },
//   coinText: {
//     fontWeight: 'bold',
//     color: '#B36F05',
//     fontSize: 14,
//   },

//   // --- BUTTON ---
//   bottomContainer: {
//     position: 'absolute',
//     bottom: 50,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//   },
//   button: {
//     backgroundColor: '#FFF',
//     paddingVertical: 18,
//     paddingHorizontal: 80,
//     borderRadius: 40,
//     shadowColor: '#FFF',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.2,
//     shadowRadius: 20,
//     elevation: 5,
//   },
//   buttonText: {
//     color: '#0F2027',
//     fontSize: 18,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//   },
//   footerText: {
//     color: 'rgba(255,255,255,0.6)',
//     marginTop: 20,
//     fontSize: 12,
//     fontWeight: '500',
//   }
// });