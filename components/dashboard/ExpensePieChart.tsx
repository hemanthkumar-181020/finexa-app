// import React from 'react';
// import { View, Text, Dimensions } from 'react-native';
// import { PieChart } from 'react-native-chart-kit';
// import { Transaction } from '../../types/transaction';
// import { groupExpensesByCategory } from '../../utils/charts';


// type Props = {
//   transactions: Transaction[];
// };

// const screenWidth = Dimensions.get('window').width;

// export function ExpensePieChart({ transactions }: Props) {
//   const data = groupExpensesByCategory(transactions);

//   if (!data.length) {
//     return <Text style={{ color: '#aaa' }}>No expense data</Text>;
//   }

//   return (
//     <View>
//       <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>
//         Expense Breakdown
//       </Text>

//       <PieChart
//         data={data}
//         width={screenWidth - 32}
//         height={220}
//         accessor="amount"
//         backgroundColor="transparent"
//         paddingLeft="16"
//         chartConfig={{
//           color: () => '#fff',
//         }}
//         absolute
//       />
//     </View>
//   );
// }


//.........new.......................................................................................................................................................
// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Dimensions, Pressable, TouchableWithoutFeedback, ScrollView } from 'react-native';
// import Svg, { G, Path, Circle } from 'react-native-svg';
// import { Transaction } from '../../types/transaction';
// import { groupExpensesByCategory } from '../../utils/charts';

// type Props = {
//   transactions: Transaction[];
// };

// const screenWidth = Dimensions.get('window').width;
// const CHART_SIZE = Math.min(screenWidth - 32, 320);
// const CENTER = CHART_SIZE / 2;
// const OUTER_RADIUS = CENTER - 25;
// const INNER_RADIUS = OUTER_RADIUS * 0.6;

// export function ExpensePieChart({ transactions }: Props) {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);
//   const data = groupExpensesByCategory(transactions);

//   if (!data.length) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>No expense data</Text>
//       </View>
//     );
//   }

//   const total = data.reduce((sum, item) => sum + item.amount, 0);

//   // Create polar to cartesian converter
//   const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
//     const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
//     return {
//       x: centerX + radius * Math.cos(angleInRadians),
//       y: centerY + radius * Math.sin(angleInRadians),
//     };
//   };

//   // Create arc path
//   const createArcPath = (
//     startAngle: number,
//     endAngle: number,
//     outerRadius: number,
//     innerRadius: number
//   ) => {
//     const start = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
//     const end = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);
//     const innerStart = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
//     const innerEnd = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);

//     const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

//     const d = [
//       'M', start.x, start.y,
//       'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
//       'L', innerEnd.x, innerEnd.y,
//       'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
//       'Z'
//     ].join(' ');

//     return d;
//   };

//   // Generate segments
//   const segments = data.map((item, index) => {
//     const percentage = (item.amount / total) * 100;
//     const angle = (percentage / 100) * 360;
    
//     // Calculate start angle
//     const startAngle = data.slice(0, index).reduce((sum, d) => {
//       return sum + ((d.amount / total) * 360);
//     }, 0);
    
//     const endAngle = startAngle + angle;
//     const isActive = activeIndex === index;
    
//     // Adjust radius for active state
//     const outerRadius = isActive ? OUTER_RADIUS + 8 : OUTER_RADIUS;
//     const innerRadius = isActive ? INNER_RADIUS - 4 : INNER_RADIUS;

//     return {
//       path: createArcPath(startAngle, endAngle, outerRadius, innerRadius),
//       color: item.color,
//       name: item.name,
//       amount: item.amount,
//       percentage,
//       index,
//       isActive,
//     };
//   });

//   const handleSegmentPress = (index: number) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   const handleBackgroundPress = () => {
//     if (activeIndex !== null) {
//       setActiveIndex(null);
//     }
//   };

//   return (
//     <ScrollView>
//     <TouchableWithoutFeedback onPress={handleBackgroundPress}>
//       <View style={styles.container}>
//         <Text style={styles.title}>Expense Breakdown</Text>

//         <View style={styles.chartWrapper}>
//           <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
//             <G>
//               {/* Render all segments */}
//               {segments.map((segment) => (
//                 <Path
//                   key={segment.index}
//                   d={segment.path}
//                   fill={segment.isActive ? lightenColor(segment.color, 35) : segment.color}
//                   opacity={activeIndex === null || segment.isActive ? 1 : 0.45}
//                   onPress={() => handleSegmentPress(segment.index)}
//                   strokeWidth={segment.isActive ? 3 : 0}
//                   stroke={segment.isActive ? '#fff' : 'none'}
//                 />
//               ))}

//               {/* Center hole */}
//               <Circle
//                 cx={CENTER}
//                 cy={CENTER}
//                 r={INNER_RADIUS - 8}
//                 fill="#1F2937"
//               />
//             </G>
//           </Svg>

//           {/* Center overlay text */}
//           <View style={styles.centerOverlay} pointerEvents="none">
//             {activeIndex !== null ? (
//               <>
//                 <Text style={styles.centerAmount}>
//                   ₹{segments[activeIndex].amount.toLocaleString('en-IN')}
//                 </Text>
//                 <Text style={styles.centerPercentage}>
//                   {segments[activeIndex].percentage.toFixed(1)}%
//                 </Text>
//                 <Text style={styles.centerCategory} numberOfLines={2}>
//                   {segments[activeIndex].name}
//                 </Text>
//               </>
//             ) : (
//               <>
//                 <Text style={styles.centerTotal}>
//                   ₹{total.toLocaleString('en-IN')}
//                 </Text>
//                 <Text style={styles.centerLabel}>Total Spent</Text>
//               </>
//             )}
//           </View>
//         </View>

//         {/* Legend */}
//         <View style={styles.legendWrapper}>
//           {data.map((item, index) => {
//             const isActive = activeIndex === index;
//             const percentage = ((item.amount / total) * 100).toFixed(1);

//             return (
//               <Pressable
//                 key={index}
//                 style={[
//                   styles.legendItem,
//                   isActive && styles.legendItemActive,
//                 ]}
//                 onPress={() => handleSegmentPress(index)}
//               >
//                 <View style={styles.legendLeft}>
//                   <View
//                     style={[
//                       styles.colorDot,
//                       {
//                         backgroundColor: isActive
//                           ? lightenColor(item.color, 35)
//                           : item.color,
//                       },
//                       isActive && styles.colorDotActive,
//                     ]}
//                   />
//                   <View style={styles.legendInfo}>
//                     <Text
//                       style={[
//                         styles.categoryName,
//                         isActive && styles.categoryNameActive,
//                       ]}
//                       numberOfLines={1}
//                     >
//                       {item.name}
//                     </Text>
//                     <Text style={styles.categoryPercent}>{percentage}%</Text>
//                   </View>
//                 </View>
//                 <Text
//                   style={[
//                     styles.categoryAmount,
//                     isActive && styles.categoryAmountActive,
//                   ]}
//                 >
//                   ₹{item.amount.toLocaleString('en-IN')}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         {activeIndex !== null && (
//           <Text style={styles.tapHint}>Tap anywhere to deselect</Text>
//         )}
//       </View>
//     </TouchableWithoutFeedback>
//     </ScrollView>
//   );
// }

// function lightenColor(color: string, percent: number): string {
//   const num = parseInt(color.replace('#', ''), 16);
//   const amt = Math.round(2.55 * percent);
//   const R = Math.min(255, (num >> 16) + amt);
//   const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
//   const B = Math.min(255, (num & 0x0000ff) + amt);
//   return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
// }

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 16,
//   },
//   title: {
//     color: '#fff',
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 28,
//     letterSpacing: 0.5,
//   },
//   emptyContainer: {
//     padding: 32,
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//     borderRadius: 16,
//   },
//   emptyText: {
//     color: '#9CA3AF',
//     fontSize: 15,
//   },
//   chartWrapper: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 32,
//     position: 'relative',
//   },
//   centerOverlay: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: INNER_RADIUS * 2,
//     paddingHorizontal: 16,
//   },
//   centerTotal: {
//     color: '#fff',
//     fontSize: 32,
//     fontWeight: '800',
//     letterSpacing: -1,
//   },
//   centerAmount: {
//     color: '#fff',
//     fontSize: 28,
//     fontWeight: '800',
//     letterSpacing: -0.5,
//   },
//   centerPercentage: {
//     color: '#10B981',
//     fontSize: 22,
//     fontWeight: '700',
//     marginTop: 4,
//   },
//   centerCategory: {
//     color: '#D1D5DB',
//     fontSize: 14,
//     fontWeight: '600',
//     marginTop: 8,
//     textAlign: 'center',
//     lineHeight: 18,
//   },
//   centerLabel: {
//     color: '#9CA3AF',
//     fontSize: 14,
//     fontWeight: '600',
//     marginTop: 6,
//   },
//   legendWrapper: {
//     gap: 12,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: 'rgba(255, 255, 255, 0.06)',
//     paddingVertical: 16,
//     paddingHorizontal: 18,
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   legendItemActive: {
//     backgroundColor: 'rgba(16, 185, 129, 0.15)',
//     borderColor: 'rgba(16, 185, 129, 0.6)',
//   },
//   legendLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     gap: 14,
//   },
//   colorDot: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   colorDotActive: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     shadowOpacity: 0.5,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   legendInfo: {
//     flex: 1,
//     gap: 3,
//   },
//   categoryName: {
//     color: '#E5E7EB',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   categoryNameActive: {
//     color: '#fff',
//     fontWeight: '700',
//   },
//   categoryPercent: {
//     color: '#9CA3AF',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   categoryAmount: {
//     color: '#D1D5DB',
//     fontSize: 16,
//     fontWeight: '700',
//     marginLeft: 12,
//   },
//   categoryAmountActive: {
//     color: '#10B981',
//     fontSize: 17,
//     fontWeight: '800',
//   },
//   tapHint: {
//     color: '#6B7280',
//     fontSize: 12,
//     fontWeight: '500',
//     textAlign: 'center',
//     marginTop: 16,
//     fontStyle: 'italic',
//   },
// });

///////////my

// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   Pressable,
//   TouchableWithoutFeedback,
//   ScrollView,
//   Modal,
// } from 'react-native';
// import Svg, { G, Path, Circle } from 'react-native-svg';
// import { Transaction } from '../../types/transaction';
// import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
// import { CATEGORY_DESCRIPTIONS, ALL_CATEGORIES } from '../../utils/categories';

// type Props = {
//   transactions: Transaction[];
// };

// type ComparisonMode = 'all' | 'selected';

// const screenWidth = Dimensions.get('window').width;
// const CHART_SIZE = Math.min(screenWidth - 64, 320);
// const CENTER = CHART_SIZE / 2;
// const OUTER_RADIUS = CENTER - 28;
// const INNER_RADIUS = OUTER_RADIUS * 0.6;

// // Your color pairs
// const COLOR_PAIRS = [
//   { main: "#63C6AF", light: "#9FE3D4" },  // Mint Green
//   { main: "#6C6FCF", light: "#9EA2E6" },  // Purple
//   { main: "#5A7FBF", light: "#9BB6E2" },  // Blue
//   { main: "#6E4A9C", light: "#9F88C3" },  // Dark Purple
//   { main: "#C57A7A", light: "#E6B1B1" },  // Coral
//   { main: "#3FA0AA", light: "#8ED0D6" },  // Teal
//   { main: "#6DB2DA", light: "#B6DDF2" },  // Light Blue
//   { main: "#D38A57", light: "#F0B183" },  // Orange
//   { main: "#5FB79A", light: "#A9E3D1" },  // Green
//   { main: "#6A6FCF", light: "#A1A6E8" },  // Purple 2
//   { main: "#5E83C4", light: "#9EB9E6" },  // Blue 2
// ];

// // Default colors
// const DEFAULT_COLORS = { main: "#94A3B8", light: "#CBD5E1" };

// // Category icons mapping - improved with better icons
// const CATEGORY_ICONS: Record<string, { icon: string; library: string }> = {
//   "Recharge": { icon: "smartphone", library: "Feather" },
//   "Food & Dining": { icon: "restaurant", library: "MaterialIcons" },
//   "Fuel": { icon: "local-gas-station", library: "MaterialIcons" },
//   "Shopping": { icon: "shopping-bag", library: "Feather" },
//   "Groceries": { icon: "shopping-cart", library: "Feather" },
//   "Travel": { icon: "airplane", library: "Ionicons" },
//   "Entertainment": { icon: "film", library: "Feather" },
//   "Utilities": { icon: "flash", library: "Ionicons" },
//   "Education": { icon: "book-open", library: "Feather" },
//   "Healthcare": { icon: "heart-pulse", library: "MaterialCommunityIcons" },
//   "Banking & Finance": { icon: "bank", library: "FontAwesome5" },
//   "Transfer Out": { icon: "arrow-up-right", library: "Feather" },
//   "Income / Transfer In": { icon: "trending-up", library: "Feather" },
//   "Personal Care": { icon: "user", library: "Feather" },
//   "Home & Kitchen": { icon: "home", library: "Feather" },
//   "Gifts & Donations": { icon: "gift", library: "Feather" },
//   "Business Expenses": { icon: "briefcase", library: "Feather" },
//   "Hobbies & Leisure": { icon: "music", library: "Feather" },
//   "Vehicle Maintenance": { icon: "car", library: "Feather" },
//   "Child & Family": { icon: "users", library: "Feather" },
//   "Technology & Software": { icon: "cpu", library: "Feather" },
//   "Other Expense": { icon: "more-horizontal", library: "Feather" },
// };

// const getCategoryIcon = (category: string) => {
//   const iconData = CATEGORY_ICONS[category] || CATEGORY_ICONS["Other Expense"];
//   return iconData;
// };

// const renderIcon = (category: string, size: number = 18, color: string = "#374151") => {
//   const iconData = getCategoryIcon(category);
  
//   switch (iconData.library) {
//     case "MaterialIcons":
//       return <MaterialIcons name={iconData.icon as any} size={size} color={color} />;
//     case "FontAwesome5":
//       return <FontAwesome5 name={iconData.icon as any} size={size} color={color} />;
//     case "MaterialCommunityIcons":
//       return <MaterialCommunityIcons name={iconData.icon as any} size={size} color={color} />;
//     case "Feather":
//     case "Ionicons":
//     default:
//       return <Ionicons name={iconData.icon as any} size={size} color={color} />;
//   }
// };

// export function ExpensePieChart({ transactions }: Props) {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);
//   const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('all');
//   const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);

//   // Get color for a category
//   const getCategoryColors = (categoryName: string, index: number) => {
//     const colorIndex = index % COLOR_PAIRS.length;
//     return COLOR_PAIRS[colorIndex] || DEFAULT_COLORS;
//   };

//   // Group expenses by category using backend categorization
//   const groupedData = useMemo(() => {
//     const grouped = transactions.reduce((acc, transaction) => {
//       const category = transaction.category || 'Other Expense';
      
//       if (!acc[category]) {
//         acc[category] = {
//           name: category,
//           amount: 0,
//           count: 0,
//           transactions: []
//         };
//       }
      
//       if (transaction.type === 'expense') {
//         acc[category].amount += Math.abs(transaction.amount);
//         acc[category].count += 1;
//         acc[category].transactions.push(transaction);
//       }
      
//       return acc;
//     }, {} as Record<string, { name: string; amount: number; count: number; transactions: Transaction[] }>);

//     return Object.values(grouped)
//       .filter(item => item.amount > 0)
//       .sort((a, b) => b.amount - a.amount)
//       .map((item, index) => {
//         const colors = getCategoryColors(item.name, index);
//         return {
//           ...item,
//           color: colors.main,
//           gradientColor: colors.light,
//           description: CATEGORY_DESCRIPTIONS[item.name] || 'Miscellaneous expenses',
//         };
//       });
//   }, [transactions]);

//   // Get available categories from actual data
//   const availableCategories = useMemo(() => {
//     return groupedData.map(item => item.name);
//   }, [groupedData]);

//   // Filter data based on comparison mode
//   const data = useMemo(() => {
//     if (comparisonMode === 'selected' && selectedCategories.length > 0) {
//       return groupedData.filter(item => selectedCategories.includes(item.name));
//     }
//     return groupedData;
//   }, [groupedData, comparisonMode, selectedCategories]);

//   // Calculate total spent
//   const totalSpent = useMemo(() => {
//     return data.reduce((sum, item) => sum + item.amount, 0);
//   }, [data]);

//   // Handle category selection
//   const toggleCategory = (category: string) => {
//     if (selectedCategories.includes(category)) {
//       if (selectedCategories.length > 1) {
//         setSelectedCategories(prev => prev.filter(c => c !== category));
//       }
//     } else {
//       setSelectedCategories(prev => [...prev, category]);
//     }
//   };

//   const selectAllCategories = () => {
//     setSelectedCategories(availableCategories);
//   };

//   const clearAllCategories = () => {
//     setSelectedCategories([]);
//   };

//   // Polar to cartesian coordinates
//   const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
//     const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
//     return {
//       x: centerX + radius * Math.cos(angleInRadians),
//       y: centerY + radius * Math.sin(angleInRadians),
//     };
//   };

//   // Create arc path for donut chart
//   const createArcPath = (
//     startAngle: number,
//     endAngle: number,
//     outerRadius: number,
//     innerRadius: number
//   ) => {
//     const start = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
//     const end = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);
//     const innerStart = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
//     const innerEnd = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);

//     const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

//     return [
//       'M', start.x, start.y,
//       'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
//       'L', innerEnd.x, innerEnd.y,
//       'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
//       'Z'
//     ].join(' ');
//   };

//   // Generate chart segments
//   const segments = data.map((item, index) => {
//     const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
//     const angle = (percentage / 100) * 360;
    
//     const startAngle = data.slice(0, index).reduce((sum, d) => {
//       return sum + ((d.amount / totalSpent) * 360);
//     }, 0);
    
//     const endAngle = startAngle + angle;
//     const isActive = activeIndex === index;
    
//     const outerRadius = isActive ? OUTER_RADIUS + 8 : OUTER_RADIUS;
//     const innerRadius = isActive ? INNER_RADIUS - 4 : INNER_RADIUS;

//     return {
//       path: createArcPath(startAngle, endAngle, outerRadius, innerRadius),
//       color: item.color,
//       gradientColor: item.gradientColor,
//       name: item.name,
//       amount: item.amount,
//       percentage,
//       index,
//       isActive,
//     };
//   });

//   const handleSegmentPress = (index: number) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   const handleBackgroundPress = () => {
//     if (activeIndex !== null) {
//       setActiveIndex(null);
//     }
//   };

//   const activeSegment = activeIndex !== null ? segments[activeIndex] : null;

//   if (!groupedData.length) {
//     return (
//       <View style={styles.emptyContainer}>
//         <View style={styles.emptyIcon}>
//           <Ionicons name="pie-chart-outline" size={48} color="#6C6FCF" />
//         </View>
//         <Text style={styles.emptyTitle}>No Expenses Yet</Text>
//         <Text style={styles.emptyText}>Add some transactions to see your spending breakdown</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.screenContainer}>
//       <ScrollView 
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <TouchableWithoutFeedback onPress={handleBackgroundPress}>
//           <View style={styles.container}>
//             {/* Header Section */}
//             <View style={styles.headerSection}>
//               <View style={styles.headerLeft}>
//                 <Text style={styles.title}>Expense Breakdown</Text>
//                 <View style={styles.statsContainer}>
//                   <View style={styles.statBadge}>
//                     <Ionicons name="layers-outline" size={14} color="#4B5563" />
//                     <Text style={styles.statText}>{data.length} categories</Text>
//                   </View>
//                   <View style={styles.statBadge}>
//                     <Ionicons name="cash-outline" size={14} color="#4B5563" />
//                     <Text style={styles.statText}>₹{totalSpent.toLocaleString('en-IN')}</Text>
//                   </View>
//                 </View>
//               </View>
//               <Pressable 
//                 style={styles.comparisonButton}
//                 onPress={() => setShowCategoryModal(true)}
//               >
//                 <Ionicons name="options-outline" size={18} color="#FFFFFF" />
//                 <Text style={styles.comparisonButtonText}>Compare</Text>
//               </Pressable>
//             </View>

//             {/* Mode Toggle */}
//             <View style={styles.modeToggleContainer}>
//               <Pressable
//                 style={[
//                   styles.modeButton,
//                   comparisonMode === 'all' && styles.modeButtonActive,
//                 ]}
//                 onPress={() => setComparisonMode('all')}
//               >
//                 <Ionicons 
//                   name="grid-outline" 
//                   size={16} 
//                   color={comparisonMode === 'all' ? "#6C6FCF" : "#9CA3AF"} 
//                 />
//                 <Text style={[
//                   styles.modeButtonText,
//                   comparisonMode === 'all' && styles.modeButtonTextActive,
//                 ]}>
//                   All
//                 </Text>
//               </Pressable>
//               <Pressable
//                 style={[
//                   styles.modeButton,
//                   comparisonMode === 'selected' && styles.modeButtonActive,
//                 ]}
//                 onPress={() => {
//                   setComparisonMode('selected');
//                   if (selectedCategories.length === 0 && availableCategories.length > 0) {
//                     setSelectedCategories(availableCategories.slice(0, Math.min(3, availableCategories.length)));
//                   }
//                 }}
//               >
//                 <Ionicons 
//                   name="funnel-outline" 
//                   size={16} 
//                   color={comparisonMode === 'selected' ? "#6C6FCF" : "#9CA3AF"} 
//                 />
//                 <Text style={[
//                   styles.modeButtonText,
//                   comparisonMode === 'selected' && styles.modeButtonTextActive,
//                 ]}>
//                   Selected
//                 </Text>
//               </Pressable>
//             </View>

//             {/* Chart Section */}
//             <View style={styles.chartSection}>
//               <View style={styles.chartWrapper}>
//                 <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
//                   <G>
//                     {segments.map((segment) => (
//                       <Path
//                         key={segment.index}
//                         d={segment.path}
//                         fill={segment.isActive ? segment.gradientColor : segment.color}
//                         opacity={segment.isActive ? 1 : 0.9}
//                         onPress={() => handleSegmentPress(segment.index)}
//                         strokeWidth={segment.isActive ? 3 : 1.5}
//                         stroke={segment.isActive ? '#FFFFFF' : '#FFFFFF'}
//                       />
//                     ))}
//                     <Circle
//                       cx={CENTER}
//                       cy={CENTER}
//                       r={INNER_RADIUS - 8}
//                       fill="#FFFFFF"
//                       stroke="#F3F4F6"
//                       strokeWidth={1.5}
//                     />
//                   </G>
//                 </Svg>

//                 <View style={styles.centerOverlay} pointerEvents="none">
//                   <View style={styles.centerContent}>
//                     {activeSegment ? (
//                       <>
//                         <Text style={styles.centerAmount}>
//                           ₹{activeSegment.amount.toLocaleString('en-IN')}
//                         </Text>
//                         <View style={styles.centerBadge}>
//                           <Text style={styles.centerPercentage}>
//                             {activeSegment.percentage.toFixed(1)}%
//                           </Text>
//                         </View>
//                         <Text style={styles.centerCategory} numberOfLines={1}>
//                           {activeSegment.name}
//                         </Text>
//                       </>
//                     ) : (
//                       <>
//                         <View style={styles.totalIcon}>
//                           <Ionicons 
//                             name={comparisonMode === 'selected' ? "git-compare" : "pie-chart"} 
//                             size={24} 
//                             color="#6C6FCF" 
//                           />
//                         </View>
//                         <Text style={styles.centerTotal}>
//                           ₹{totalSpent.toLocaleString('en-IN')}
//                         </Text>
//                         <Text style={styles.centerLabel}>
//                           {comparisonMode === 'selected' ? 'Selected Total' : 'Total Spent'}
//                         </Text>
//                       </>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               {/* Active Segment Indicator */}
//               {activeSegment && (
//                 <View style={styles.activeIndicator}>
//                   <View style={[styles.activeColor, { backgroundColor: activeSegment.color }]} />
//                   <View style={styles.activeInfo}>
//                     <Text style={styles.activeText} numberOfLines={1}>
//                       {activeSegment.name}
//                     </Text>
//                     <Text style={styles.activePercentage}>
//                       {activeSegment.percentage.toFixed(1)}% • ₹{activeSegment.amount.toLocaleString('en-IN')}
//                     </Text>
//                   </View>
//                   <View style={[styles.activeIcon, { backgroundColor: activeSegment.color + '20' }]}>
//                     {renderIcon(activeSegment.name, 18, activeSegment.color)}
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Legend Section */}
//             <View style={styles.legendSection}>
//               <View style={styles.legendHeader}>
//                 <View style={styles.legendTitleContainer}>
//                   <Ionicons name="list-outline" size={20} color="#374151" />
//                   <Text style={styles.legendTitle}>Categories</Text>
//                 </View>
//                 <View style={styles.selectionBadge}>
//                   <Text style={styles.selectionBadgeText}>
//                     {comparisonMode === 'selected' ? `${selectedCategories.length} selected` : 'All'}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.legendWrapper}>
//                 {data.map((item, index) => {
//                   const isActive = activeIndex === index;
//                   const percentage = totalSpent > 0 ? ((item.amount / totalSpent) * 100).toFixed(1) : '0.0';

//                   return (
//                     <Pressable
//                       key={index}
//                       style={[
//                         styles.legendItem,
//                         isActive && styles.legendItemActive,
//                       ]}
//                       onPress={() => handleSegmentPress(index)}
//                     >
//                       <View style={styles.legendItemContent}>
//                         <View style={styles.legendLeft}>
//                           <View style={styles.colorIndicator}>
//                             <View
//                               style={[
//                                 styles.colorDot,
//                                 {
//                                   backgroundColor: isActive ? item.gradientColor : item.color,
//                                   borderColor: isActive ? '#FFFFFF' : '#FFFFFF',
//                                 },
//                               ]}
//                             />
//                           </View>
//                           <View style={styles.categoryIconContainer}>
//                             {renderIcon(item.name, 16, item.color)}
//                           </View>
//                           <View style={styles.legendInfo}>
//                             <View style={styles.categoryHeader}>
//                               <Text
//                                 style={[
//                                   styles.categoryName,
//                                   isActive && styles.categoryNameActive,
//                                 ]}
//                                 numberOfLines={1}
//                               >
//                                 {item.name}
//                               </Text>
//                               <Text style={styles.categoryAmount}>
//                                 ₹{item.amount.toLocaleString('en-IN')}
//                               </Text>
//                             </View>
//                             <View style={styles.progressContainer}>
//                               <View style={styles.progressBar}>
//                                 <View 
//                                   style={[
//                                     styles.progressFill,
//                                     { 
//                                       width: `${parseFloat(percentage)}%` as any,
//                                       backgroundColor: item.color,
//                                     }
//                                   ]} 
//                                 />
//                               </View>
//                               <View style={styles.progressLabels}>
//                                 <Text style={styles.progressText}>{percentage}%</Text>
//                                 <Text style={styles.transactionCount}>{item.count} trx</Text>
//                               </View>
//                             </View>
//                           </View>
//                         </View>
//                       </View>
//                     </Pressable>
//                   );
//                 })}
//               </View>
//             </View>

//             {/* Hint Section */}
//             {activeIndex !== null && (
//               <View style={styles.hintContainer}>
//                 <Ionicons name="information-circle-outline" size={14} color="#6C6FCF" />
//                 <Text style={styles.tapHint}>Tap anywhere to deselect</Text>
//               </View>
//             )}
//           </View>
//         </TouchableWithoutFeedback>
//       </ScrollView>

//       {/* Category Selection Modal */}
//       <Modal
//         visible={showCategoryModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowCategoryModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             {/* Modal Header */}
//             <View style={styles.modalHeader}>
//               <View>
//                 <Text style={styles.modalTitle}>Select Categories</Text>
//                 <Text style={styles.modalSubtitle}>
//                   Choose categories to compare
//                 </Text>
//               </View>
//               <Pressable 
//                 style={styles.closeButton}
//                 onPress={() => setShowCategoryModal(false)}
//               >
//                 <Ionicons name="close" size={24} color="#374151" />
//               </Pressable>
//             </View>

//             {/* Modal Actions */}
//             <View style={styles.modalActions}>
//               <Pressable 
//                 style={styles.modalActionButton} 
//                 onPress={selectAllCategories}
//               >
//                 <Ionicons name="checkmark-done" size={18} color="#6C6FCF" />
//                 <Text style={styles.modalActionButtonText}>Select All</Text>
//               </Pressable>
//               <Pressable 
//                 style={styles.modalActionButton} 
//                 onPress={clearAllCategories}
//               >
//                 <Ionicons name="close-circle" size={18} color="#EF4444" />
//                 <Text style={[styles.modalActionButtonText, styles.clearButtonText]}>Clear All</Text>
//               </Pressable>
//             </View>

//             {/* Category List */}
//             <ScrollView 
//               style={styles.categoryList}
//               showsVerticalScrollIndicator={false}
//             >
//               {availableCategories.map((category, index) => {
//                 const isSelected = selectedCategories.includes(category);
//                 const categoryData = groupedData.find(item => item.name === category);
//                 const colors = getCategoryColors(category, index);
//                 const percentage = categoryData && totalSpent > 0 ? 
//                   ((categoryData.amount / totalSpent) * 100).toFixed(1) : '0.0';
                
//                 return (
//                   <Pressable
//                     key={category}
//                     style={[
//                       styles.categoryItem,
//                       isSelected && styles.categoryItemSelected,
//                     ]}
//                     onPress={() => toggleCategory(category)}
//                   >
//                     <View style={styles.categoryItemLeft}>
//                       <View style={[
//                         styles.categoryCheckbox,
//                         isSelected && styles.categoryCheckboxSelected,
//                         { backgroundColor: isSelected ? colors.main : '#F1F5F9' }
//                       ]}>
//                         {isSelected && (
//                           <Ionicons name="checkmark" size={14} color="#FFFFFF" />
//                         )}
//                       </View>
//                       <View style={[styles.categoryIconContainer, { backgroundColor: colors.main + '15' }]}>
//                         {renderIcon(category, 18, colors.main)}
//                       </View>
//                       <View style={styles.categoryTextContainer}>
//                         <Text style={[
//                           styles.categoryItemText,
//                           isSelected && styles.categoryItemTextSelected,
//                         ]}>
//                           {category}
//                         </Text>
//                         <Text style={styles.categoryItemSubtext}>
//                           {categoryData?.count || 0} transactions
//                         </Text>
//                       </View>
//                     </View>
                    
//                     <View style={styles.categoryItemRight}>
//                       <Text style={styles.categoryItemAmount}>
//                         ₹{categoryData?.amount.toLocaleString('en-IN') || '0'}
//                       </Text>
//                       <View style={[styles.categoryItemPercentageBadge, { backgroundColor: colors.main + '15' }]}>
//                         <Text style={[styles.categoryItemPercentageText, { color: colors.main }]}>
//                           {percentage}%
//                         </Text>
//                       </View>
//                     </View>
//                   </Pressable>
//                 );
//               })}
//             </ScrollView>

//             {/* Modal Footer */}
//             <View style={styles.modalFooter}>
//               <View style={styles.footerInfo}>
//                 <Text style={styles.selectedCount}>
//                   {selectedCategories.length} categories selected
//                 </Text>
//                 <Text style={styles.totalText}>
//                   Total: ₹{data.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
//                 </Text>
//               </View>
//               <Pressable 
//                 style={[styles.applyButton, selectedCategories.length === 0 && styles.applyButtonDisabled]}
//                 onPress={() => {
//                   if (selectedCategories.length > 0) {
//                     setComparisonMode('selected');
//                   }
//                   setShowCategoryModal(false);
//                 }}
//                 disabled={selectedCategories.length === 0}
//               >
//                 <Ionicons name="checkmark" size={20} color="#FFFFFF" />
//                 <Text style={styles.applyButtonText}>
//                   Apply ({selectedCategories.length})
//                 </Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screenContainer: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   scrollContent: {
//     padding: 16,
//   },
//   container: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 4,
//   },
  
//   // Header Section
//   headerSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 20,
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   title: {
//     color: '#1E293B',
//     fontSize: 24,
//     fontWeight: '700',
//     letterSpacing: -0.5,
//     marginBottom: 8,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   statBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statText: {
//     color: '#475569',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   comparisonButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: '#6C6FCF',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 14,
//     shadowColor: '#6C6FCF',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   comparisonButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
  
//   // Mode Toggle
//   modeToggleContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F1F5F9',
//     borderRadius: 14,
//     padding: 6,
//     marginBottom: 24,
//   },
//   modeButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//   },
//   modeButtonActive: {
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   modeButtonText: {
//     color: '#64748B',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   modeButtonTextActive: {
//     color: '#1E293B',
//     fontWeight: '700',
//   },
  
//   // Chart Section
//   chartSection: {
//     alignItems: 'center',
//     marginBottom: 28,
//   },
//   chartWrapper: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//     marginBottom: 20,
//   },
//   centerOverlay: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: (INNER_RADIUS - 8) * 1.6,
//     height: (INNER_RADIUS - 8) * 1.6,
//   },
//   centerContent: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     paddingHorizontal: 8,
//   },
//   totalIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
//   centerTotal: {
//     color: '#1E293B',
//     fontSize: 22,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   centerAmount: {
//     color: '#1E293B',
//     fontSize: 20,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   centerBadge: {
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 10,
//     marginTop: 6,
//   },
//   centerPercentage: {
//     color: '#475569',
//     fontSize: 13,
//     fontWeight: '700',
//   },
//   centerCategory: {
//     color: '#475569',
//     fontSize: 14,
//     fontWeight: '600',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   centerLabel: {
//     color: '#94A3B8',
//     fontSize: 13,
//     fontWeight: '500',
//     marginTop: 4,
//     textAlign: 'center',
//   },
  
//   // Active Indicator
//   activeIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: '#F1F5F9',
//     width: '100%',
//   },
//   activeColor: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     marginRight: 12,
//     borderWidth: 2,
//     borderColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   activeInfo: {
//     flex: 1,
//   },
//   activeText: {
//     color: '#1E293B',
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   activePercentage: {
//     color: '#64748B',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   activeIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
  
//   // Legend Section
//   legendSection: {
//     marginTop: 4,
//   },
//   legendHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   legendTitleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   legendTitle: {
//     color: '#1E293B',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   selectionBadge: {
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   selectionBadgeText: {
//     color: '#475569',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   legendWrapper: {
//     gap: 10,
//   },
//   legendItem: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: '#F1F5F9',
//     overflow: 'hidden',
//   },
//   legendItemActive: {
//     borderColor: '#6C6FCF',
//     shadowColor: '#6C6FCF',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   legendItemContent: {
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//   },
//   legendLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   colorIndicator: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   colorDot: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   categoryIconContainer: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   legendInfo: {
//     flex: 1,
//     gap: 8,
//   },
//   categoryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   categoryName: {
//     color: '#334155',
//     fontSize: 15,
//     fontWeight: '600',
//     flex: 1,
//     marginRight: 8,
//   },
//   categoryNameActive: {
//     color: '#1E293B',
//   },
//   categoryAmount: {
//     color: '#475569',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   progressContainer: {
//     gap: 6,
//   },
//   progressBar: {
//     height: 5,
//     backgroundColor: '#E2E8F0',
//     borderRadius: 2.5,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 2.5,
//   },
//   progressLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   progressText: {
//     color: '#64748B',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   transactionCount: {
//     color: '#94A3B8',
//     fontSize: 11,
//     fontWeight: '500',
//   },
  
//   // Hint Container
//   hintContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 20,
//     gap: 8,
//     paddingVertical: 12,
//     backgroundColor: '#F1F5F9',
//     borderRadius: 12,
//   },
//   tapHint: {
//     color: '#64748B',
//     fontSize: 13,
//     fontWeight: '500',
//   },
  
//   // Empty State
//   emptyContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 40,
//     alignItems: 'center',
//     margin: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 4,
//   },
//   emptyIcon: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   emptyTitle: {
//     color: '#1E293B',
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyText: {
//     color: '#64748B',
//     fontSize: 14,
//     textAlign: 'center',
//     lineHeight: 20,
//   },
  
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '85%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingHorizontal: 20,
//     paddingTop: 24,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   modalTitle: {
//     color: '#1E293B',
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   modalSubtitle: {
//     color: '#64748B',
//     fontSize: 14,
//     fontWeight: '500',
//     marginTop: 4,
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 12,
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   modalActionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#F8FAFC',
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#F1F5F9',
//   },
//   modalActionButtonText: {
//     color: '#334155',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   clearButtonText: {
//     color: '#EF4444',
//   },
//   categoryList: {
//     maxHeight: 380,
//     paddingHorizontal: 4,
//   },
//   categoryItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginHorizontal: 12,
//     marginVertical: 4,
//   },
//   categoryItemSelected: {
//     backgroundColor: '#F8FAFC',
//   },
//   categoryItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     flex: 1,
//   },
//   categoryCheckbox: {
//     width: 22,
//     height: 22,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//   },
//   categoryCheckboxSelected: {
//     borderColor: 'transparent',
//   },
//   categoryTextContainer: {
//     flex: 1,
//   },
//   categoryItemText: {
//     color: '#334155',
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   categoryItemTextSelected: {
//     color: '#1E293B',
//   },
//   categoryItemSubtext: {
//     color: '#94A3B8',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   categoryItemRight: {
//     alignItems: 'flex-end',
//     gap: 6,
//   },
//   categoryItemAmount: {
//     color: '#475569',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   categoryItemPercentageBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 8,
//   },
//   categoryItemPercentageText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   modalFooter: {
//     padding: 20,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#F1F5F9',
//     gap: 12,
//   },
//   footerInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   selectedCount: {
//     color: '#64748B',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   totalText: {
//     color: '#1E293B',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   applyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#6C6FCF',
//     paddingVertical: 14,
//     borderRadius: 14,
//     shadowColor: '#6C6FCF',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   applyButtonDisabled: {
//     backgroundColor: '#CBD5E1',
//     shadowColor: 'transparent',
//   },
//   applyButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
} from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { Transaction } from '../../types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_DESCRIPTIONS, ALL_CATEGORIES } from '../../utils/categories';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

type Props = {
  transactions: Transaction[];
};

type ComparisonMode = 'all' | 'selected';

const screenWidth = Dimensions.get('window').width;
const CHART_SIZE = Math.min(screenWidth - 80, 280); // Reduced size
const CENTER = CHART_SIZE / 2;
const OUTER_RADIUS = CENTER - 20; // Reduced outer radius
const INNER_RADIUS = OUTER_RADIUS * 0.5; // Smaller inner hole
const [barWidth, setBarWidth] = useState(0);

// Updated color pairs - more distinct colors
// Use only your specified 10 color pairs
const COLOR_PAIRS = [
  { main: "#63C6AF", light: "#9FE3D4" },  // Mint Green
  { main: "#6C6FCF", light: "#9EA2E6" },  // Indigo / Blue-Purple
  { main: "#5A7FBF", light: "#9BB6E2" },  // Blue
  { main: "#6E4A9C", light: "#9F88C3" },  // Purple
  { main: "#C57A7A", light: "#E6B1B1" },  // Rose / Soft Red
  { main: "#3FA0AA", light: "#8ED0D6" },  // Teal
  { main: "#6DB2DA", light: "#B6DDF2" },  // Sky Blue
  { main: "#D38A57", light: "#F0B183" },  // Orange
  { main: "#6A6FCF", light: "#A1A6E8" },  // Violet-Blue
  { main: "#5E83C4", light: "#9EB9E6" },  // Steel Blue
];

// Global map to track which color each category gets
const categoryColorIndexMap: Record<string, number> = {};
let nextColorIndex = 0;

// Get color for a category - ensures no repetition until all colors are used
// Replace your getCategoryColors function with this:
const getCategoryColors = (categoryName: string, index: number) => {
  // Create a hash from category name for consistent color assignment
  const hash = categoryName.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Use modulo with total color pairs
  const colorIndex = hash % COLOR_PAIRS.length;
  
  return COLOR_PAIRS[colorIndex] || COLOR_PAIRS[0];
};

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  "Recharge": "phone-portrait-outline",
  "Food & Dining": "fast-food-outline",
  "Fuel": "car-outline",
  "Shopping": "bag-handle-outline",
  "Groceries": "cart-outline",
  "Travel": "airplane-outline",
  "Entertainment": "film-outline",
  "Utilities": "flash-outline",
  "Education": "book-outline",
  "Healthcare": "medkit-outline",
  "Banking & Finance": "cash-outline",
  "Transfer Out": "arrow-up-circle-outline",
  "Income / Transfer In": "arrow-down-circle-outline",
  "Personal Care": "person-outline",
  "Home & Kitchen": "home-outline",
  "Gifts & Donations": "gift-outline",
  "Business Expenses": "briefcase-outline",
  "Hobbies & Leisure": "game-controller-outline",
  "Vehicle Maintenance": "car-sport-outline",
  "Child & Family": "people-outline",
  "Technology & Software": "hardware-chip-outline",
  "Transport": "bus-outline",
  "Bills": "document-text-outline",
  "Other Expense": "ellipsis-horizontal-circle-outline",
};

const getCategoryIcon = (category: string) => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS["Other Expense"];
};

export function ExpensePieChart({ transactions }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Group expenses by category
  const groupedData = useMemo(() => {
    const grouped = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other Expense';
      
      if (!acc[category]) {
        acc[category] = {
          name: category,
          amount: 0,
          count: 0,
          transactions: []
        };
      }
      
      if (transaction.type === 'expense') {
        acc[category].amount += Math.abs(transaction.amount);
        acc[category].count += 1;
        acc[category].transactions.push(transaction);
      }
      
      return acc;
    }, {} as Record<string, { name: string; amount: number; count: number; transactions: Transaction[] }>);

    return Object.values(grouped)
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map((item,index) => {
        const colors = getCategoryColors(item.name,index);
        return {
          ...item,
          color: colors.main,
          lightColor: colors.light,
          description: CATEGORY_DESCRIPTIONS[item.name] || 'Miscellaneous expenses',
        };
      });
  }, [transactions]);

  // Get available categories from actual data
  const availableCategories = useMemo(() => {
    return groupedData.map(item => item.name);
  }, [groupedData]);

  // Filter data based on comparison mode
  const data = useMemo(() => {
    if (comparisonMode === 'selected' && selectedCategories.length > 0) {
      return groupedData.filter(item => selectedCategories.includes(item.name));
    }
    return groupedData;
  }, [groupedData, comparisonMode, selectedCategories]);

  // Calculate total spent
  const totalSpent = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  // Handle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(prev => prev.filter(c => c !== category));
      }
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const selectAllCategories = () => {
    setSelectedCategories(availableCategories);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  // Polar to cartesian coordinates
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Create arc path for donut chart
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    const start = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
    const end = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);
    const innerStart = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
    const innerEnd = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  };

  // Generate chart segments
  const segments = useMemo(() => {
  let cumulativeAngle = 0;
  
  return data.map((item, index) => {
    const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
    const angle = (percentage / 100) * 360;
    
    // ADD THIS LINE: Ensure minimum angle for visibility
    const minAngle = 2;
    const displayAngle = Math.max(angle, minAngle);
    
    const startAngle = cumulativeAngle;
    const endAngle = startAngle + displayAngle;  // Use displayAngle instead of angle
    cumulativeAngle += displayAngle;  // Use displayAngle here too
    
    const isActive = activeIndex === index;
    
    const outerRadius = isActive ? OUTER_RADIUS + 5 : OUTER_RADIUS;
    const innerRadius = isActive ? INNER_RADIUS - 3 : INNER_RADIUS;

    return {
      path: createArcPath(startAngle, endAngle, outerRadius, innerRadius),
      color: item.color,
      lightColor: item.lightColor,
      name: item.name,
      amount: item.amount,
      percentage,  // Keep original percentage for display
      index,
      isActive,
      startAngle,
      endAngle,
    };
  });
}, [data, totalSpent, activeIndex]);

  const handleSegmentPress = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleBackgroundPress = () => {
    if (activeIndex !== null) {
      setActiveIndex(null);
    }
  };

  const activeSegment = activeIndex !== null ? segments[activeIndex] : null;

  if (!groupedData.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="pie-chart-outline" size={48} color="#6C6FCF" />
        </View>
        <Text style={styles.emptyTitle}>No Expenses Yet</Text>
        <Text style={styles.emptyText}>Add some transactions to see your spending breakdown</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Expense Breakdown</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statBadge}>
                    <Ionicons name="layers-outline" size={14} color="#4B5563" />
                    <Text style={styles.statText}>{data.length} categories</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="cash-outline" size={14} color="#4B5563" />
                    <Text style={styles.statText}>₹{totalSpent.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              </View>
              <Pressable 
                style={styles.comparisonButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Ionicons name="options-outline" size={18} color="#6C6FCF" />
                <Text style={styles.comparisonButtonText}>Compare</Text>
              </Pressable>
            </View>

            {/* Mode Toggle */}
            <View style={styles.modeToggleContainer}>
              <Pressable
                style={[
                  styles.modeButton,
                  comparisonMode === 'all' && styles.modeButtonActive,
                ]}
                onPress={() => setComparisonMode('all')}
              >
                <Ionicons 
                  name="grid-outline" 
                  size={16} 
                  color={comparisonMode === 'all' ? "#6C6FCF" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.modeButtonText,
                  comparisonMode === 'all' && styles.modeButtonTextActive,
                ]}>
                  All
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modeButton,
                  comparisonMode === 'selected' && styles.modeButtonActive,
                ]}
                onPress={() => {
                  setComparisonMode('selected');
                  if (selectedCategories.length === 0 && availableCategories.length > 0) {
                    setSelectedCategories(availableCategories.slice(0, Math.min(3, availableCategories.length)));
                  }
                }}
              >
                <Ionicons 
                  name="funnel-outline" 
                  size={16} 
                  color={comparisonMode === 'selected' ? "#6C6FCF" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.modeButtonText,
                  comparisonMode === 'selected' && styles.modeButtonTextActive,
                ]}>
                  Selected
                </Text>
              </Pressable>
            </View>

            {/* Chart Section */}
            <View style={styles.chartSection}>
              <View style={styles.chartWrapper}>
                <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
                  <G>
                    {segments.map((segment) => (
                      <Path
                        key={segment.index}
                        d={segment.path}
                        fill={segment.isActive ? segment.lightColor : segment.color}
                        onPress={() => handleSegmentPress(segment.index)}
                        strokeWidth={segment.isActive ? 3 : 1.5}
                        stroke="#FFFFFF"
                      />
                    ))}
                    <Circle
                      cx={CENTER}
                      cy={CENTER}
                      r={INNER_RADIUS - 5}
                      fill="#FFFFFF"
                      stroke="#F3F4F6"
                      strokeWidth={1}
                    />
                  </G>
                </Svg>

                <View style={styles.centerOverlay} pointerEvents="none">
                  <View style={styles.centerContent}>
                    {activeSegment ? (
                      <>
                        <Text style={styles.centerAmount}>
                          ₹{activeSegment.amount.toLocaleString('en-IN')}
                        </Text>
                        <View style={styles.centerBadge}>
                          <Text style={styles.centerPercentage}>
                            {activeSegment.percentage.toFixed(1)}%
                          </Text>
                        </View>
                        <Text style={styles.centerCategory} numberOfLines={1}>
                          {activeSegment.name}
                        </Text>
                      </>
                    ) : (
                      <>
                        <View style={styles.totalIcon}>
                          <Ionicons 
                            name={comparisonMode === 'selected' ? "git-compare" : "pie-chart"} 
                            size={20} 
                            color="#6C6FCF" 
                          />
                        </View>
                        <Text style={styles.centerTotal}>
                          ₹{totalSpent.toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.centerLabel}>
                          {comparisonMode === 'selected' ? 'Selected Total' : 'Total Spent'}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Active Segment Indicator */}
              {activeSegment && (
                <View style={styles.activeIndicator}>
                  <View style={[styles.activeColor, { backgroundColor: activeSegment.color }]} />
                  <View style={styles.activeInfo}>
                    <Text style={styles.activeText} numberOfLines={1}>
                      {activeSegment.name}
                    </Text>
                    <Text style={styles.activePercentage}>
                      {activeSegment.percentage.toFixed(1)}% • ₹{activeSegment.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={[styles.activeIcon, { backgroundColor: activeSegment.color + '20' }]}>
                    <Ionicons name={getCategoryIcon(activeSegment.name) as any} size={16} color={activeSegment.color} />
                  </View>
                </View>
              )}
            </View>

            {/* Legend Section */}
            <View style={styles.legendSection}>
              <View style={styles.legendHeader}>
                <View style={styles.legendTitleContainer}>
                  <Ionicons name="list-outline" size={18} color="#374151" />
                  <Text style={styles.legendTitle}>Categories</Text>
                </View>
                <View style={styles.selectionBadge}>
                  <Text style={styles.selectionBadgeText}>
                    {comparisonMode === 'selected' ? `${selectedCategories.length} selected` : 'All'}
                  </Text>
                </View>
              </View>
              
              {/* <View style={styles.legendWrapper}>
                {data.map((item, index) => {
                  const isActive = activeIndex === index;
                  const percentage = totalSpent > 0 ? ((item.amount / totalSpent) * 100).toFixed(1) : '0.0';

                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.legendItem,
                        isActive && styles.legendItemActive,
                      ]}
                      onPress={() => handleSegmentPress(index)}
                    >
                      <View style={styles.legendItemContent}>
                        <View style={styles.legendLeft}>
                          <View style={styles.colorIndicator}>
                            <View
                              style={[
                                styles.colorDot,
                                {
                                  backgroundColor: item.color,
                                },
                              ]}
                            />
                          </View>
                          <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '15' }]}>
                            <Ionicons name={getCategoryIcon(item.name) as any} size={14} color={item.color} />
                          </View>
                          <View style={styles.legendInfo}>
                            <View style={styles.categoryHeader}>
                              <Text
                                style={[
                                  styles.categoryName,
                                  isActive && styles.categoryNameActive,
                                ]}
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>
                              <Text style={styles.categoryAmount}>
                                ₹{item.amount.toLocaleString('en-IN')}
                              </Text>
                            </View>
                            <View style={styles.progressContainer}>
                              <View style={styles.progressBar}>
                                <View 
                                  style={[
                                    styles.progressFill,
                                    { 
                                      width: `${parseFloat(percentage)}%` as any,
                                      backgroundColor: item.color,
                                    }
                                  ]} 
                                />
                              </View>
                              <View style={styles.progressLabels}>
                                <Text style={styles.progressText}>{percentage}%</Text>
                                <Text style={styles.transactionCount}>{item.count} trx</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View> */}
              <View style={styles.categoryGrid}>
              {data.map((item, index) => {
                
                 const percentage = totalSpent > 0 ? Math.min((item.amount / totalSpent) * 100, 100) : 0;

                return (
                  <Pressable
                    key={item.name}
                    onPress={() => {
                       Haptics.selectionAsync();
                       handleSegmentPress(index);}
                    }
                    style={styles.categoryRowWrapper}
                  >
                    <LinearGradient
                      colors={[item.lightColor, item.color]}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={styles.categoryRowCard}
                    >
                      {/* Icon */}
                      <View style={styles.rowIcon}>
                        <Ionicons
                          name={getCategoryIcon(item.name) as any}
                          size={20}
                          color="#fff"
                        />
                      </View>

                      {/* Center: Name + Progress */}
                      <View style={styles.rowCenter}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {item.name}
                        </Text>

                        {/* Progress Bar */}
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { flex: percentage }]} />
                          <View style={{ flex: 100 - percentage }} />
                        </View>



                        <Text style={styles.rowSub}>
                          {percentage.toFixed(1)}% • {item.count} trx
                        </Text>
                      </View>


                      {/* Amount */}
                      <Text style={styles.rowAmount}>
                        ₹{item.amount.toLocaleString('en-IN')}
                      </Text>
                      
                    </LinearGradient>
                </Pressable>

                  );
                })}
              </View>

              </View>

              {/* Hint Section */}
              {activeIndex !== null && (
                <View style={styles.hintContainer}>
                  <Ionicons name="information-circle-outline" size={12} color="#6C6FCF" />
                  <Text style={styles.tapHint}>Tap anywhere to deselect</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Select Categories</Text>
                  <Text style={styles.modalSubtitle}>
                    Choose categories to compare
                  </Text>
                </View>
                <Pressable 
                  style={styles.closeButton}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </Pressable>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Pressable 
                style={styles.modalActionButton} 
                onPress={selectAllCategories}
              >
                <Ionicons name="checkmark-done" size={16} color="#6C6FCF" />
                <Text style={styles.modalActionButtonText}>Select All</Text>
              </Pressable>
              <Pressable 
                style={styles.modalActionButton} 
                onPress={clearAllCategories}
              >
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                <Text style={[styles.modalActionButtonText, styles.clearButtonText]}>Clear All</Text>
              </Pressable>
            </View>

            {/* Category List */}
            <ScrollView 
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
            >
              {availableCategories.map((category,index) => {
                const isSelected = selectedCategories.includes(category);
                const categoryData = groupedData.find(item => item.name === category);
                 const colors = getCategoryColors(category, index);
                const percentage = categoryData && totalSpent > 0 ? 
                  ((categoryData.amount / totalSpent) * 100).toFixed(1) : '0.0';
                
                return (
                  <Pressable
                    key={category}
                    style={[
                      styles.categoryItem,
                      isSelected && styles.categoryItemSelected,
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <View style={styles.categoryItemLeft}>
                      <View style={[
                        styles.categoryCheckbox,
                        isSelected && styles.categoryCheckboxSelected,
                        { backgroundColor: isSelected ? colors.main : '#F1F5F9' }
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={[styles.categoryIconContainer, { backgroundColor: colors.main + '15' }]}>
                        <Ionicons name={getCategoryIcon(category) as any} size={16} color={colors.main} />
                      </View>
                      <View style={styles.categoryTextContainer}>
                        <Text style={[
                          styles.categoryItemText,
                          isSelected && styles.categoryItemTextSelected,
                        ]}>
                          {category}
                        </Text>
                        <Text style={styles.categoryItemSubtext}>
                          {categoryData?.count || 0} transactions
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.categoryItemRight}>
                      <Text style={styles.categoryItemAmount}>
                        ₹{categoryData?.amount.toLocaleString('en-IN') || '0'}
                      </Text>
                      <View style={[styles.categoryItemPercentageBadge, { backgroundColor: colors.main + '15' }]}>
                        <Text style={[styles.categoryItemPercentageText, { color: colors.main }]}>
                          {percentage}%
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <View style={styles.footerInfo}>
                <Text style={styles.selectedCount}>
                  {selectedCategories.length} categories selected
                </Text>
                <Text style={styles.totalText}>
                  Total: ₹{data.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <Pressable 
                style={[styles.applyButton, selectedCategories.length === 0 && styles.applyButtonDisabled]}
                onPress={() => {
                  if (selectedCategories.length > 0) {
                    setComparisonMode('selected');
                  }
                  setShowCategoryModal(false);
                }}
                disabled={selectedCategories.length === 0}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>
                  Apply ({selectedCategories.length})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
  },
  
  // Header Section
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    color: '#1E293B',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  comparisonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#6C6FCF',
  },
  comparisonButtonText: {
    color: '#6C6FCF',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Mode Toggle
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  modeButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#1E293B',
    fontWeight: '700',
  },
  
  // Chart Section
  chartSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: (INNER_RADIUS - 5) * 1.4,
    height: (INNER_RADIUS - 5) * 1.4,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 6,
  },
  totalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  centerTotal: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerAmount: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  centerPercentage: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
  },
  centerCategory: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  centerLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  
  // Active Indicator
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    width: '100%',
  },
  activeColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  activeInfo: {
    flex: 1,
  },
  activeText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activePercentage: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  activeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Legend Section
  legendSection: {
    flex: 1,
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
  },
  selectionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  selectionBadgeText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  legendWrapper: {
    gap: 8,
  },
  legendItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  legendItemActive: {
    borderColor: '#6C6FCF',
    borderWidth: 1.5,
  },
  legendItemContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendInfo: {
    flex: 1,
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  categoryNameActive: {
    color: '#1E293B',
  },
  categoryAmount: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
  flexDirection: 'row',
  height: 6,
  backgroundColor: 'rgba(255,255,255,0.25)',
  borderRadius: 4,
  overflow: 'hidden',
  marginTop: 6,
},

progressFill: {
  backgroundColor: 'rgba(255,255,255,0.85)',
  borderRadius: 4,
},


  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  transactionCount: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  
  // Hint Container
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  tapHint: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  modalActionButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#EF4444',
  },
  categoryList: {
    maxHeight: 360,
    paddingHorizontal: 4,
    flexDirection: 'column',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 3,
  },
  categoryItemSelected: {
    backgroundColor: '#F8FAFC',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryCheckboxSelected: {
    borderColor: 'transparent',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryItemText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryItemTextSelected: {
    color: '#1E293B',
  },
  categoryItemSubtext: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  categoryItemRight: {
    alignItems: 'flex-end',
    gap: 5,
  },
  categoryItemAmount: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryItemPercentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryItemPercentageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCount: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  totalText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#6C6FCF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  categoryGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginTop: 12,
},

categoryRowWrapper: {
  width: '100%',          // 🔴 FULL WIDTH
  marginBottom: 14,
},

categoryRowCard: {
  width: '100%',          // 🔴 FULL WIDTH
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 18,
  paddingHorizontal: 16,
  borderRadius: 18,
},

rowIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.25)',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 14,
},

rowTitle: {
  flex: 1,                // 🔴 PUSH amount to right
  color: '#fff',
  fontSize: 15,
  fontWeight: '700',
},

rowAmount: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '700',
},
rowCenter: {
  flex: 1,
  marginRight: 12,
},

// progressBar: {
//   height: 6,
//   backgroundColor: 'rgba(255,255,255,0.35)', // track
//   borderRadius: 4,
//   overflow: 'hidden',
//   marginTop: 6,
//   marginBottom: 4,
// },

// progressFill: {
//   height: '100%',
//   backgroundColor: '#FFFFFF', // white bar
//   borderRadius: 4,
// },

rowSub: {
  fontSize: 12,
  color: 'rgba(255,255,255,0.85)',
},
   

});