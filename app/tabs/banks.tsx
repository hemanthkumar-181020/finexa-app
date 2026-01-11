
import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image, 
  Animated,
  Dimensions 
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import PhonePeModal from '../banks/phonepe';
import MessagesModal from '../banks/messages';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Source {
  name: string;
  subtitle: string;
  tags: string[];
  route: string;
  image: any;
  gradientColors: string[];
  accentColor: string;
  iconBg: string;
}

interface SourceCardProps {
  source: Source;
  index: number;
  onPhonePePress: () => void;
  onMessagesPress: () => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, index, onPhonePePress, onMessagesPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: index * 100,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (source.name === "PhonePe") {
      onPhonePePress();
    } else if (source.name === "Messages") {
      onMessagesPress();
    } else {
      router.push(source.route);
    }
  };

  return (
    <AnimatedPressable
      style={[
        styles.card,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
          opacity: scaleAnim,
        },
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <LinearGradient
        colors={source.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Animated pulse indicator */}
        <Animated.View
          style={[
            styles.pulseIndicator,
            {
              backgroundColor: source.accentColor,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            {/* Clean circular logo */}
            <View style={styles.logoWrapper}>
              <Image
                source={source.image}
                style={styles.logo}
              />
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.title}>{source.name}</Text>
              <Text style={styles.subtitle}>{source.subtitle}</Text>
            </View>
          </View>

          {/* Arrow indicator */}
          
        </View>

        {/* Shine overlay effect */}
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shineOverlay}
        />
      </LinearGradient>
    </AnimatedPressable>
  );
};

export default function Banks() {
  const [showPhonePeModal, setShowPhonePeModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Floating background animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Badge animations
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim1, {
            toValue: 1.6,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const sources = [
    {
      name: "PhonePe",
      subtitle: "UPI • Wallet • Rewards",
      tags: ["UPI", "Instant"],
      route: "/banks/phonepe",
      image: require("../../assets/images/phonepe.png"),
      gradientColors: ['#0f172a', '#1e293b'],
      accentColor: '#8b5cf6',
      iconBg: '#8b5cf620',
    },
    {
      name: "YONO SBI",
      subtitle: "SBI Digital Banking",
      tags: ["Bank", "Secure"],
      route: "/banks/sbi",
      image: require("../../assets/images/yono.png"),
      gradientColors: ['#0f172a', '#1e293b'],
      accentColor: '#d3016a',
      iconBg: '#3b82f620',
    },
    {
      name: "Messages",
      subtitle: "Import transactions from SMS",
      tags: ["SMS", "Auto"],
      route: "/banks/messages",
      image: require("../../assets/images/message.png"),
      gradientColors: ['#0f172a', '#1e293b'],
      accentColor: '#3b82f6',
      iconBg: '#10b98120',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Animated background gradients */}
      <Animated.View
        style={[
          styles.bgGradient1,
          {
            transform: [
              {
                translateY: floatAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bgGradient2,
          {
            transform: [
              {
                translateY: floatAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
              },
            ],
          },
        ]}
      />

      <View style={styles.content}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Status Badge */}
          

        <View style={{ 
            flexDirection: 'row',
            alignItems: 'center',      // vertical alignment
            justifyContent: 'center',  // center as a group
            gap: 10,                   // space between text & dot (RN ≥0.71)
          }}>
          
          <Animated.View
                        style={[
                          styles.badgeDot,
                          {
                            transform: [{ scale: scaleAnim1 }],
                            opacity: opacityAnim,
                          },
                        ]}

          />
          <Text style={styles.heading}>Choose your Source</Text>    
        </View>
        <Text style={styles.subheading}>
                    Connect your preferred payment source to start tracking
                  </Text>
        </Animated.View>

        {/* Source Cards */}
        <View style={styles.cardsContainer}>
          {sources.map((source: Source, index: number) => (
            <SourceCard 
              key={source.name} 
              source={source} 
              index={index}
              onPhonePePress={() => setShowPhonePeModal(true)}
              onMessagesPress={() => setShowMessagesModal(true)}
            />
          ))}
        </View>

        {/* Info Footer */}
        <Animated.View
          style={[
            styles.infoContainer,
            {
              opacity: headerAnim,
            },
          ]}
        >
          <BlurView intensity={10} style={styles.blurContainer}>
            <View style={styles.infoContent}>
              <Text style={styles.infoIcon}>🔒</Text>
              <Text style={styles.infoText}>
                Your credentials are encrypted and secured. We never store your passwords.
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      </View>

      {/* PhonePe Modal */}
      {showPhonePeModal && (
        <PhonePeModal 
          visible={showPhonePeModal}
          onClose={() => setShowPhonePeModal(false)}
        />
      )}

      {/* Messages Modal */}
      {showMessagesModal && (
        <MessagesModal 
          visible={showMessagesModal}
          onClose={() => setShowMessagesModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  bgGradient1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: '#10b98120',
    borderRadius: 150,
    opacity: 0.3,
  },
  bgGradient2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    backgroundColor: '#3b82f620',
    borderRadius: 125,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#10b98130',
    marginBottom: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 8,
    marginBottom:6,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heading: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  subheading: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth:1,
    borderColor: "#10b981",
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 24,
    overflow: 'hidden',
  },
  pulseIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
   row: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoWrapper: {
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 16,
},
logo: {
  width: 40,
  height: 40,
  borderRadius: 20,
  resizeMode: 'cover',
},
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: "#020817",
    borderColor: "#10b981",
    
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 16,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  textBlock: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '700',
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: -width,
    right: width,
    bottom: 0,
    width: width * 2,
  },
  infoContainer: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f172a80',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
});