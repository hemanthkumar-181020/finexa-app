import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
const { width, height } = Dimensions.get('window');
import {auth} from '../services/firebase';

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
  const [user,setUser]=useState(null);

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



  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  });
  return unsubscribe;
}, []);



  const handleGetStarted = () => {
  if (user) {
    router.replace('/tabs/home');
  } else {
    
    router.replace('/(auth)/signup');
  }
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
    backgroundColor: '#000000ff',
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
    backgroundColor: 'rgba(2, 5, 8, 0)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(8, 8, 8, 1)',
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
