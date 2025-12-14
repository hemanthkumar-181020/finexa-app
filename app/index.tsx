import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const router = useRouter();
  
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1.5)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  
  // FINEXA text animations
  const letterF = useRef(new Animated.ValueXY({ x: -200, y: -200 })).current;
  const letterI = useRef(new Animated.ValueXY({ x: 200, y: -200 })).current;
  const letterN = useRef(new Animated.ValueXY({ x: -200, y: 0 })).current;
  const letterE = useRef(new Animated.ValueXY({ x: 200, y: 0 })).current;
  const letterX = useRef(new Animated.ValueXY({ x: -200, y: 200 })).current;
  const letterA = useRef(new Animated.ValueXY({ x: 200, y: 200 })).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  // Loading bar
  const loadingBarWidth = useRef(new Animated.Value(0)).current;
  const loadingBarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Step 1: Logo fades in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      // Pause
      Animated.delay(500),
      
      // Logo shrinks 
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.35,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: -height * 0.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      //  Loading bar
      Animated.parallel([
        Animated.timing(loadingBarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(loadingBarWidth, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]),
      
      // FINEXA text
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(letterF, {
          toValue: { x: 0, y: 0 },
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(letterI, {
          toValue: { x: 0, y: 0 },
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(letterN, {
          toValue: { x: 0, y: 0 },
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(letterE, {
          toValue: { x: 0, y: 0 },
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(letterX, {
          toValue: { x: 0, y: 0 },
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(letterA, {
          toValue: { x: 0, y: 0 },
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      
      // Delay
      Animated.delay(300),
      
      // Get Started button
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    
    router.replace('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      {/* FINEXA Text */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Animated.Text
          style={[styles.letter, { transform: [{ translateX: letterF.x }, { translateY: letterF.y }] }]}
        >
          F
        </Animated.Text>
        <Animated.Text
          style={[styles.letter, { transform: [{ translateX: letterI.x }, { translateY: letterI.y }] }]}
        >
          I
        </Animated.Text>
        <Animated.Text
          style={[styles.letter, { transform: [{ translateX: letterN.x }, { translateY: letterN.y }] }]}
        >
          N
        </Animated.Text>
        <Animated.Text
          style={[styles.letter, { transform: [{ translateX: letterE.x }, { translateY: letterE.y }] }]}
        >
          E
        </Animated.Text>
        <Animated.Text
          style={[styles.letter, { transform: [{ translateX: letterX.x }, { translateY: letterX.y }] }]}
        >
          X
        </Animated.Text>
        <Animated.Text
          style={[styles.letter, { transform: [{ translateX: letterA.x }, { translateY: letterA.y }] }]}
        >
          A
        </Animated.Text>
      </Animated.View>

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
          },
        ]}
      >
        {/* Circle */}
        <Animated.View
          style={[
            styles.circle,
            { opacity: circleOpacity, transform: [{ scale: circleScale }] },
          ]}
        />
        
        {/* Logo */}
        <Image
          source={require('../assets/images/finexa-logo.png.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Loading Bar */}
        <Animated.View style={[styles.loadingBarContainer, { opacity: loadingBarOpacity }]}>
          <View style={styles.loadingBarBackground}>
            <Animated.View
              style={[
                styles.loadingBarFill,
                {
                  width: loadingBarWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Get Started Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          { opacity: buttonOpacity, transform: [{ translateY: buttonTranslateY }] },
        ]}
      >
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
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
  textContainer: {
    position: 'absolute',
    top: height * 0.15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: 48,
    fontWeight: '900',
    color: '#79c3c2',
    marginHorizontal: 2,
    textShadowColor: 'rgba(252, 211, 77, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
  },
  circle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderWidth: 3,
    borderColor: 'rgba(251, 146, 60, 0.4)',
  },
  logo: {
    width: 280,
    height: 280,
    zIndex: 1,
  },
  loadingBarContainer: {
    position: 'absolute',
    bottom: -40,
    width: 200,
    alignItems: 'center',
  },
  loadingBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: '#79c3c2',
    borderRadius: 2,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#79c3c2',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 20,
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
  },
});
