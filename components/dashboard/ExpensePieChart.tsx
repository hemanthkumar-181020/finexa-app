
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
// import { Ionicons } from '@expo/vector-icons';
// import { CATEGORY_DESCRIPTIONS, ALL_CATEGORIES } from '../../utils/categories';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Haptics from 'expo-haptics';

// type Props = {
//   transactions: Transaction[];
// };

// type ComparisonMode = 'all' | 'selected';

// const screenWidth = Dimensions.get('window').width;
// const CHART_SIZE = Math.min(screenWidth - 80, 280); // Reduced size
// const CENTER = CHART_SIZE / 2;
// const OUTER_RADIUS = CENTER - 20; // Reduced outer radius
// const INNER_RADIUS = OUTER_RADIUS * 0.5; // Smaller inner hole
// const [barWidth, setBarWidth] = useState(0);

// // Updated color pairs - more distinct colors
// // Use only your specified 10 color pairs
// const COLOR_PAIRS = [
//   { main: "#63C6AF", light: "#9FE3D4" },  // Mint Green
//   { main: "#6C6FCF", light: "#9EA2E6" },  // Indigo / Blue-Purple
//   { main: "#5A7FBF", light: "#9BB6E2" },  // Blue
//   { main: "#6E4A9C", light: "#9F88C3" },  // Purple
//   { main: "#C57A7A", light: "#E6B1B1" },  // Rose / Soft Red
//   { main: "#3FA0AA", light: "#8ED0D6" },  // Teal
//   { main: "#6DB2DA", light: "#B6DDF2" },  // Sky Blue
//   { main: "#D38A57", light: "#F0B183" },  // Orange
//   { main: "#6A6FCF", light: "#A1A6E8" },  // Violet-Blue
//   { main: "#5E83C4", light: "#9EB9E6" },  // Steel Blue
// ];

// // Global map to track which color each category gets
// const categoryColorIndexMap: Record<string, number> = {};
// let nextColorIndex = 0;

// // Get color for a category - ensures no repetition until all colors are used
// // Replace your getCategoryColors function with this:
// const getCategoryColors = (categoryName: string, index: number) => {
//   // Create a hash from category name for consistent color assignment
//   const hash = categoryName.split('').reduce((acc, char) => {
//     return acc + char.charCodeAt(0);
//   }, 0);
  
//   // Use modulo with total color pairs
//   const colorIndex = hash % COLOR_PAIRS.length;
  
//   return COLOR_PAIRS[colorIndex] || COLOR_PAIRS[0];
// };

// // Category icons mapping
// const CATEGORY_ICONS: Record<string, string> = {
//   "Recharge": "phone-portrait-outline",
//   "Food & Dining": "fast-food-outline",
//   "Fuel": "car-outline",
//   "Shopping": "bag-handle-outline",
//   "Groceries": "cart-outline",
//   "Travel": "airplane-outline",
//   "Entertainment": "film-outline",
//   "Utilities": "flash-outline",
//   "Education": "book-outline",
//   "Healthcare": "medkit-outline",
//   "Banking & Finance": "cash-outline",
//   "Transfer Out": "arrow-up-circle-outline",
//   "Income / Transfer In": "arrow-down-circle-outline",
//   "Personal Care": "person-outline",
//   "Home & Kitchen": "home-outline",
//   "Gifts & Donations": "gift-outline",
//   "Business Expenses": "briefcase-outline",
//   "Hobbies & Leisure": "game-controller-outline",
//   "Vehicle Maintenance": "car-sport-outline",
//   "Child & Family": "people-outline",
//   "Technology & Software": "hardware-chip-outline",
//   "Transport": "bus-outline",
//   "Bills": "document-text-outline",
//   "Other Expense": "ellipsis-horizontal-circle-outline",
// };

// const getCategoryIcon = (category: string) => {
//   return CATEGORY_ICONS[category] || CATEGORY_ICONS["Other Expense"];
// };

// export function ExpensePieChart({ transactions }: Props) {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);
//   const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('all');
//   const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);

//   // Group expenses by category
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
//       .map((item,index) => {
//         const colors = getCategoryColors(item.name,index);
//         return {
//           ...item,
//           color: colors.main,
//           lightColor: colors.light,
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
//   const segments = useMemo(() => {
//   let cumulativeAngle = 0;
  
//   return data.map((item, index) => {
//     const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
//     const angle = (percentage / 100) * 360;
    
//     // ADD THIS LINE: Ensure minimum angle for visibility
//     const minAngle = 2;
//     const displayAngle = Math.max(angle, minAngle);
    
//     const startAngle = cumulativeAngle;
//     const endAngle = startAngle + displayAngle;  // Use displayAngle instead of angle
//     cumulativeAngle += displayAngle;  // Use displayAngle here too
    
//     const isActive = activeIndex === index;
    
//     const outerRadius = isActive ? OUTER_RADIUS + 5 : OUTER_RADIUS;
//     const innerRadius = isActive ? INNER_RADIUS - 3 : INNER_RADIUS;

//     return {
//       path: createArcPath(startAngle, endAngle, outerRadius, innerRadius),
//       color: item.color,
//       lightColor: item.lightColor,
//       name: item.name,
//       amount: item.amount,
//       percentage,  // Keep original percentage for display
//       index,
//       isActive,
//       startAngle,
//       endAngle,
//     };
//   });
// }, [data, totalSpent, activeIndex]);

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
//         style={styles.scrollView}
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
//                 <Ionicons name="options-outline" size={18} color="#6C6FCF" />
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
//                         fill={segment.isActive ? segment.lightColor : segment.color}
//                         onPress={() => handleSegmentPress(segment.index)}
//                         strokeWidth={segment.isActive ? 3 : 1.5}
//                         stroke="#FFFFFF"
//                       />
//                     ))}
//                     <Circle
//                       cx={CENTER}
//                       cy={CENTER}
//                       r={INNER_RADIUS - 5}
//                       fill="#FFFFFF"
//                       stroke="#F3F4F6"
//                       strokeWidth={1}
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
//                             size={20} 
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
//                     <Ionicons name={getCategoryIcon(activeSegment.name) as any} size={16} color={activeSegment.color} />
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Legend Section */}
//             <View style={styles.legendSection}>
//               <View style={styles.legendHeader}>
//                 <View style={styles.legendTitleContainer}>
//                   <Ionicons name="list-outline" size={18} color="#374151" />
//                   <Text style={styles.legendTitle}>Categories</Text>
//                 </View>
//                 <View style={styles.selectionBadge}>
//                   <Text style={styles.selectionBadgeText}>
//                     {comparisonMode === 'selected' ? `${selectedCategories.length} selected` : 'All'}
//                   </Text>
//                 </View>
//               </View>
              
              
//               <View style={styles.categoryGrid}>
//               {data.map((item, index) => {
                
//                  const percentage = totalSpent > 0 ? Math.min((item.amount / totalSpent) * 100, 100) : 0;

//                 return (
//                   <Pressable
//                     key={item.name}
//                     onPress={() => {
//                        Haptics.selectionAsync();
//                        handleSegmentPress(index);}
//                     }
//                     style={styles.categoryRowWrapper}
//                   >
//                     <LinearGradient
//                       colors={[item.lightColor, item.color]}
//                       start={{ x: 1, y: 0 }}
//                       end={{ x: 0, y: 0 }}
//                       style={styles.categoryRowCard}
//                     >
//                       {/* Icon */}
//                       <View style={styles.rowIcon}>
//                         <Ionicons
//                           name={getCategoryIcon(item.name) as any}
//                           size={20}
//                           color="#fff"
//                         />
//                       </View>

//                       {/* Center: Name + Progress */}
//                       <View style={styles.rowCenter}>
//                         <Text style={styles.rowTitle} numberOfLines={1}>
//                           {item.name}
//                         </Text>

//                         {/* Progress Bar */}
//                         <View style={styles.progressBar}>
//                           <View style={[styles.progressFill, { flex: percentage }]} />
//                           <View style={{ flex: 100 - percentage }} />
//                         </View>



//                         <Text style={styles.rowSub}>
//                           {percentage.toFixed(1)}% • {item.count} trx
//                         </Text>
//                       </View>


//                       {/* Amount */}
//                       <Text style={styles.rowAmount}>
//                         ₹{item.amount.toLocaleString('en-IN')}
//                       </Text>
                      
//                     </LinearGradient>
//                 </Pressable>

//                   );
//                 })}
//               </View>

//               </View>

//               {/* Hint Section */}
//               {activeIndex !== null && (
//                 <View style={styles.hintContainer}>
//                   <Ionicons name="information-circle-outline" size={12} color="#6C6FCF" />
//                   <Text style={styles.tapHint}>Tap anywhere to deselect</Text>
//                 </View>
//               )}
//             </View>
//           </TouchableWithoutFeedback>
//         </ScrollView>

//         {/* Category Selection Modal */}
//         <Modal
//           visible={showCategoryModal}
//           transparent
//           animationType="slide"
//           onRequestClose={() => setShowCategoryModal(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               {/* Modal Header */}
//               <View style={styles.modalHeader}>
//                 <View>
//                   <Text style={styles.modalTitle}>Select Categories</Text>
//                   <Text style={styles.modalSubtitle}>
//                     Choose categories to compare
//                   </Text>
//                 </View>
//                 <Pressable 
//                   style={styles.closeButton}
//                   onPress={() => setShowCategoryModal(false)}
//                 >
//                   <Ionicons name="close" size={20} color="#374151" />
//                 </Pressable>
//             </View>

//             {/* Modal Actions */}
//             <View style={styles.modalActions}>
//               <Pressable 
//                 style={styles.modalActionButton} 
//                 onPress={selectAllCategories}
//               >
//                 <Ionicons name="checkmark-done" size={16} color="#6C6FCF" />
//                 <Text style={styles.modalActionButtonText}>Select All</Text>
//               </Pressable>
//               <Pressable 
//                 style={styles.modalActionButton} 
//                 onPress={clearAllCategories}
//               >
//                 <Ionicons name="close-circle" size={16} color="#EF4444" />
//                 <Text style={[styles.modalActionButtonText, styles.clearButtonText]}>Clear All</Text>
//               </Pressable>
//             </View>

//             {/* Category List */}
//             <ScrollView 
//               style={styles.categoryList}
//               showsVerticalScrollIndicator={false}
//             >
//               {availableCategories.map((category,index) => {
//                 const isSelected = selectedCategories.includes(category);
//                 const categoryData = groupedData.find(item => item.name === category);
//                  const colors = getCategoryColors(category, index);
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
//                           <Ionicons name="checkmark" size={12} color="#FFFFFF" />
//                         )}
//                       </View>
//                       <View style={[styles.categoryIconContainer, { backgroundColor: colors.main + '15' }]}>
//                         <Ionicons name={getCategoryIcon(category) as any} size={16} color={colors.main} />
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
//                 <Ionicons name="checkmark" size={18} color="#FFFFFF" />
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
//     backgroundColor: '#FFFFFF',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 24,
//   },
//   container: {
//     flex: 1,
//   },
  
//   // Header Section
//   headerSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   title: {
//     color: '#1E293B',
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 6,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   statBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 10,
//   },
//   statText: {
//     color: '#475569',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   comparisonButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: 'transparent',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#6C6FCF',
//   },
//   comparisonButtonText: {
//     color: '#6C6FCF',
//     fontSize: 13,
//     fontWeight: '600',
//   },
  
//   // Mode Toggle
//   modeToggleContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F1F5F9',
//     borderRadius: 12,
//     padding: 4,
//     marginBottom: 20,
//   },
//   modeButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   modeButtonActive: {
//     backgroundColor: '#FFFFFF',
//   },
//   modeButtonText: {
//     color: '#64748B',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   modeButtonTextActive: {
//     color: '#1E293B',
//     fontWeight: '700',
//   },
  
//   // Chart Section
//   chartSection: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   chartWrapper: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//     marginBottom: 16,
//   },
//   centerOverlay: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: (INNER_RADIUS - 5) * 1.4,
//     height: (INNER_RADIUS - 5) * 1.4,
//   },
//   centerContent: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     paddingHorizontal: 6,
//   },
//   totalIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 6,
//   },
//   centerTotal: {
//     color: '#1E293B',
//     fontSize: 12,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   centerAmount: {
//     color: '#1E293B',
//     fontSize: 15,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   centerBadge: {
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 8,
//     marginTop: 4,
//   },
//   centerPercentage: {
//     color: '#475569',
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   centerCategory: {
//     color: '#475569',
//     fontSize: 10,
//     fontWeight: '600',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   centerLabel: {
//     color: '#94A3B8',
//     fontSize: 10,
//     fontWeight: '500',
//     marginTop: 2,
//     textAlign: 'center',
//   },
  
//   // Active Indicator
//   activeIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#F1F5F9',
//     width: '100%',
//   },
//   activeColor: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   activeInfo: {
//     flex: 1,
//   },
//   activeText: {
//     color: '#1E293B',
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   activePercentage: {
//     color: '#64748B',
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   activeIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
  
//   // Legend Section
//   legendSection: {
//     flex: 1,
//   },
//   legendHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   legendTitleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   legendTitle: {
//     color: '#1E293B',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   selectionBadge: {
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 10,
//   },
//   selectionBadgeText: {
//     color: '#475569',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   legendWrapper: {
//     gap: 8,
//   },
//   legendItem: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#F1F5F9',
//     overflow: 'hidden',
//   },
//   legendItemActive: {
//     borderColor: '#6C6FCF',
//     borderWidth: 1.5,
//   },
//   legendItemContent: {
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//   },
//   legendLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   colorIndicator: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   colorDot: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//   },
//   categoryIconContainer: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   legendInfo: {
//     flex: 1,
//     gap: 6,
//   },
//   categoryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   categoryName: {
//     color: '#334155',
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 1,
//     marginRight: 8,
//   },
//   categoryNameActive: {
//     color: '#1E293B',
//   },
//   categoryAmount: {
//     color: '#475569',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   progressContainer: {
//     gap: 4,
//   },
//   progressBar: {
//   flexDirection: 'row',
//   height: 6,
//   backgroundColor: 'rgba(255,255,255,0.25)',
//   borderRadius: 4,
//   overflow: 'hidden',
//   marginTop: 6,
// },

// progressFill: {
//   backgroundColor: 'rgba(255,255,255,0.85)',
//   borderRadius: 4,
// },


//   progressLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   progressText: {
//     color: '#64748B',
//     fontSize: 11,
//     fontWeight: '600',
//   },
//   transactionCount: {
//     color: '#94A3B8',
//     fontSize: 10,
//     fontWeight: '500',
//   },
  
//   // Hint Container
//   hintContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 16,
//     gap: 6,
//     paddingVertical: 10,
//     backgroundColor: '#F1F5F9',
//     borderRadius: 10,
//   },
//   tapHint: {
//     color: '#64748B',
//     fontSize: 12,
//     fontWeight: '500',
//   },
  
//   // Empty State
//   emptyContainer: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyIcon: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     color: '#1E293B',
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptyText: {
//     color: '#64748B',
//     fontSize: 13,
//     textAlign: 'center',
//     lineHeight: 18,
//   },
  
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '85%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingHorizontal: 18,
//     paddingTop: 20,
//     paddingBottom: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   modalTitle: {
//     color: '#1E293B',
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   modalSubtitle: {
//     color: '#64748B',
//     fontSize: 13,
//     fontWeight: '500',
//     marginTop: 2,
//   },
//   closeButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 10,
//     paddingHorizontal: 18,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   modalActionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     backgroundColor: '#F8FAFC',
//     paddingVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: '#F1F5F9',
//   },
//   modalActionButtonText: {
//     color: '#334155',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   clearButtonText: {
//     color: '#EF4444',
//   },
//   categoryList: {
//     maxHeight: 360,
//     paddingHorizontal: 4,
//     flexDirection: 'column',
//   },
//   categoryItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginHorizontal: 10,
//     marginVertical: 3,
//   },
//   categoryItemSelected: {
//     backgroundColor: '#F8FAFC',
//   },
//   categoryItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     flex: 1,
//   },
//   categoryCheckbox: {
//     width: 20,
//     height: 20,
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
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   categoryItemTextSelected: {
//     color: '#1E293B',
//   },
//   categoryItemSubtext: {
//     color: '#94A3B8',
//     fontSize: 11,
//     fontWeight: '500',
//   },
//   categoryItemRight: {
//     alignItems: 'flex-end',
//     gap: 5,
//   },
//   categoryItemAmount: {
//     color: '#475569',
//     fontSize: 13,
//     fontWeight: '700',
//   },
//   categoryItemPercentageBadge: {
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   categoryItemPercentageText: {
//     fontSize: 11,
//     fontWeight: '600',
//   },
//   modalFooter: {
//     padding: 18,
//     paddingTop: 14,
//     borderTopWidth: 1,
//     borderTopColor: '#F1F5F9',
//     gap: 10,
//   },
//   footerInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   selectedCount: {
//     color: '#64748B',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   totalText: {
//     color: '#1E293B',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   applyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     backgroundColor: '#6C6FCF',
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   applyButtonDisabled: {
//     backgroundColor: '#CBD5E1',
//   },
//   applyButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   categoryGrid: {
//   flexDirection: 'row',
//   flexWrap: 'wrap',
//   justifyContent: 'space-between',
//   marginTop: 12,
// },

// categoryRowWrapper: {
//   width: '100%',          // 🔴 FULL WIDTH
//   marginBottom: 14,
// },

// categoryRowCard: {
//   width: '100%',          // 🔴 FULL WIDTH
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingVertical: 18,
//   paddingHorizontal: 16,
//   borderRadius: 18,
// },

// rowIcon: {
//   width: 40,
//   height: 40,
//   borderRadius: 12,
//   backgroundColor: 'rgba(255,255,255,0.25)',
//   alignItems: 'center',
//   justifyContent: 'center',
//   marginRight: 14,
// },

// rowTitle: {
//   flex: 1,                // 🔴 PUSH amount to right
//   color: '#fff',
//   fontSize: 15,
//   fontWeight: '700',
// },

// rowAmount: {
//   color: '#fff',
//   fontSize: 15,
//   fontWeight: '700',
// },
// rowCenter: {
//   flex: 1,
//   marginRight: 12,
// },

// // progressBar: {
// //   height: 6,
// //   backgroundColor: 'rgba(255,255,255,0.35)', // track
// //   borderRadius: 4,
// //   overflow: 'hidden',
// //   marginTop: 6,
// //   marginBottom: 4,
// // },

// // progressFill: {
// //   height: '100%',
// //   backgroundColor: '#FFFFFF', // white bar
// //   borderRadius: 4,
// // },
//   timeFilterContainer: {
//     marginBottom: 16,
//     marginTop: 8,
//   },
  
//   timeFilterLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#6B7280',
//     marginBottom: 8,
//     marginLeft: 4,
//   },
  
//   timeFilterButtons: {
//     flexDirection: 'row',
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     padding: 4,
//   },
  
//   timeFilterButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     gap: 6,
//   },
  
//   timeFilterButtonActive: {
//     backgroundColor: '#6C6FCF',
//   },
  
//   timeFilterButtonText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#6C6FCF',
//   },
  
//   timeFilterButtonTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },

// rowSub: {
//   fontSize: 12,
//   color: 'rgba(255,255,255,0.85)',

// })

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  Alert,
  Share,
  Platform,
} from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { Transaction } from '../../types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_DESCRIPTIONS, ALL_CATEGORIES } from '../../utils/categories';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';

type Props = {
  transactions: Transaction[];
};

type ComparisonMode = 'all' | 'selected';
type TimeFilter = 'all' | 'year' | 'month';

const screenWidth = Dimensions.get('window').width;
const CHART_SIZE = Math.min(screenWidth - 80, 280);
const CENTER = CHART_SIZE / 2;
const OUTER_RADIUS = CENTER - 20;
const INNER_RADIUS = OUTER_RADIUS * 0.5;

// 21 Distinct color pairs for dark theme
const COLOR_PAIRS = [
  { main: "#63C6AF", light: "#9FE3D4" },  // Mint Green
  { main: "#6E4A9C", light: "#9F88C3" },  // Purple
  { main: "#C57A7A", light: "#E6B1B1" },  // Rose
  { main: "#3FA0AA", light: "#8ED0D6" },  // Teal
  { main: "#5A7FBF", light: "#9BB6E2" },  // Blue
  { main: "#D38A57", light: "#F0B183" },  // Orange
  { main: "#6DB2DA", light: "#B6DDF2" },  // Sky Blue
  { main: "#8B5A7C", light: "#B88FAC" },  // Mauve
  { main: "#5AA06F", light: "#93CAA3" },  // Sage Green
  { main: "#7A8FBF", light: "#ACB9E2" },  // Periwinkle
  { main: "#4D8B9B", light: "#8CBBC9" },  // Steel Blue
  { main: "#B86F8B", light: "#D4A0B8" },  // Dusty Rose
  { main: "#5FBF8F", light: "#9FE3BF" },  // Seafoam
  { main: "#9C6FAA", light: "#C3A0D6" },  // Orchid
  { main: "#6F9BBF", light: "#A3C9E2" },  // Powder Blue
  { main: "#AA7F6F", light: "#D6B3A3" },  // Terra Cotta
  { main: "#5A8F6F", light: "#8FBFA3" },  // Forest Green
  { main: "#8F6FBF", light: "#BFA3E2" },  // Lavender
  { main: "#6FBF9B", light: "#A3E3C9" },  // Aqua Green
  { main: "#BF8F6F", light: "#E2BFA3" },  // Camel
  { main: "#6F7FBF", light: "#A3AFE2" },  // Slate Blue
];

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

const getCategoryColors = (categoryName: string, index: number) => {
  const hash = categoryName.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const colorIndex = hash % COLOR_PAIRS.length;
  return COLOR_PAIRS[colorIndex] || COLOR_PAIRS[0];
};

const getAvailableYears = (transactions: Transaction[]): number[] => {
  const years = new Set<number>();
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    years.add(date.getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
};

const getAvailableMonths = (transactions: Transaction[], selectedYear: number): number[] => {
  const months = new Set<number>();
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    if (date.getFullYear() === selectedYear) {
      months.add(date.getMonth() + 1);
    }
  });
  return Array.from(months).sort((a, b) => a - b);
};

const filterTransactionsByTime = (
  transactions: Transaction[], 
  filter: TimeFilter,
  selectedYear?: number,
  selectedMonth?: number
) => {
  if (filter === 'all') {
    return transactions;
  }
  
  return transactions.filter(transaction => {
    const transDate = new Date(transaction.date);
    
    if (filter === 'year' && selectedYear) {
      return transDate.getFullYear() === selectedYear;
    }
    
    if (filter === 'month' && selectedYear && selectedMonth) {
      return (
        transDate.getFullYear() === selectedYear &&
        transDate.getMonth() + 1 === selectedMonth
      );
    }
    
    return true;
  });
};

const getMonthName = (month: number): string => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('default', { month: 'long' });
};

const exportToCSV = (data: any[], timeFilter: TimeFilter, selectedYear?: number, selectedMonth?: number) => {
  try {
    const headers = ['Category', 'Amount (₹)', 'Percentage', 'Transactions Count', 'Average per Transaction'];
    
    const rows = data.map(item => {
      const avgTransaction = item.count > 0 ? (item.amount / item.count).toFixed(2) : '0.00';
      return [
        item.name,
        item.amount.toFixed(2),
        `${((item.amount / data.reduce((sum, i) => sum + i.amount, 0)) * 100).toFixed(2)}%`,
        item.count.toString(),
        avgTransaction
      ];
    });
    
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    rows.push(['TOTAL', totalAmount.toFixed(2), '100%', '', '']);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error generating CSV:', error);
    return '';
  }
};

// Replace the saveAndShareCSV function with this:
const saveAndShareCSV = async (csvContent: string, fileName: string) => {
  try {
    // For web platform
    if (Platform.OS === 'web') {
      // Create a downloadable link for web
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      Alert.alert('Success', `CSV exported successfully: ${fileName}`);
      return true;
    }
    
    // For mobile platforms (iOS/Android)
    // First, let's create the CSV content as a string and share it directly
    // This approach doesn't require FileSystem
    
    // Create a temporary file path
    const timestamp = new Date().getTime();
    const tempFileName = `${timestamp}_${fileName}`;
    
    // For iOS/Android, we can use Share API directly with a message
    // Or we can create a temporary file URI
    
    // Option 1: Share as text content (simpler)
    const shareResult = await Share.share({
      message: csvContent,
      title: 'Export Expense Report',
    });
    
    // Option 2: If you want to save to file system (more complex)
    // We'll skip FileSystem for now to avoid the import issues
    
    Alert.alert('Success', 'CSV data ready to share or save');
    return true;
    
  } catch (error) {
    console.error('Error saving/sharing CSV:', error);
    Alert.alert('Error', 'Failed to export CSV file');
    return false;
  }
};

export function ExpensePieChart({ transactions }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const availableYears = useMemo(() => {
    return getAvailableYears(transactions);
  }, [transactions]);

  const availableMonths = useMemo(() => {
    if (selectedYear) {
      return getAvailableMonths(transactions, selectedYear);
    }
    return [];
  }, [transactions, selectedYear]);

  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  const filteredTransactions = useMemo(() => {
    return filterTransactionsByTime(transactions, timeFilter, selectedYear || undefined, selectedMonth || undefined);
  }, [transactions, timeFilter, selectedYear, selectedMonth]);

  const groupedData = useMemo(() => {
    const grouped = filteredTransactions.reduce((acc, transaction) => {
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
      .map((item, index) => {
        const colors = getCategoryColors(item.name, index);
        return {
          ...item,
          color: colors.main,
          lightColor: colors.light,
          description: CATEGORY_DESCRIPTIONS[item.name] || 'Miscellaneous expenses',
        };
      });
  }, [filteredTransactions]);

  const availableCategories = useMemo(() => {
    return groupedData.map(item => item.name);
  }, [groupedData]);

  const data = useMemo(() => {
    if (comparisonMode === 'selected' && selectedCategories.length > 0) {
      return groupedData.filter(item => selectedCategories.includes(item.name));
    }
    return groupedData;
  }, [groupedData, comparisonMode, selectedCategories]);

  const totalSpent = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

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

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(null);
    setTimeFilter('year');
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setTimeFilter('month');
  };

  const handleClearTimeFilter = () => {
    setTimeFilter('all');
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  const handleExportToCSV = async () => {
    if (data.length === 0) {
      Alert.alert('No Data', 'There is no data to export.');
      return;
    }

    setIsExporting(true);
    try {
      let fileName = 'expenses_';
      
      if (timeFilter === 'all') {
        fileName += 'all_time.csv';
      } else if (timeFilter === 'year' && selectedYear) {
        fileName += `${selectedYear}.csv`;
      } else if (timeFilter === 'month' && selectedYear && selectedMonth) {
        fileName += `${selectedYear}_${getMonthName(selectedMonth)}.csv`;
      } else {
        fileName += 'export.csv';
      }

      const csvContent = exportToCSV(data, timeFilter, selectedYear || undefined, selectedMonth || undefined);
      
      if (csvContent) {
        await saveAndShareCSV(csvContent, fileName);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

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

  const segments = useMemo(() => {
    let cumulativeAngle = 0;
    
    return data.map((item, index) => {
      const percentage = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;
      const angle = (percentage / 100) * 360;
      
      const minAngle = 2;
      const displayAngle = Math.max(angle, minAngle);
      
      const startAngle = cumulativeAngle;
      const endAngle = startAngle + displayAngle;
      cumulativeAngle += displayAngle;
      
      const isActive = activeIndex === index;
      
      const outerRadius = isActive ? OUTER_RADIUS + 5 : OUTER_RADIUS;
      const innerRadius = isActive ? INNER_RADIUS - 3 : INNER_RADIUS;

      return {
        path: createArcPath(startAngle, endAngle, outerRadius, innerRadius),
        color: item.color,
        lightColor: item.lightColor,
        name: item.name,
        amount: item.amount,
        percentage,
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

  const getTimeFilterLabel = () => {
    if (timeFilter === 'all') {
      return 'All Time';
    } else if (timeFilter === 'year' && selectedYear) {
      return selectedYear.toString();
    } else if (timeFilter === 'month' && selectedYear && selectedMonth) {
      return `${getMonthName(selectedMonth)} ${selectedYear}`;
    }
    return 'All Time';
  };

  const activeSegment = activeIndex !== null ? segments[activeIndex] : null;

  if (!groupedData.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="pie-chart-outline" size={48} color="#5DADE2" />
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
            <View style={styles.headerSection}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Expense Breakdown</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statBadge}>
                    <Ionicons name="layers-outline" size={14} color="#E0E0E0" />
                    <Text style={styles.statText}>{data.length} categories</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="cash-outline" size={14} color="#E0E0E0" />
                    <Text style={styles.statText}>₹{totalSpent.toLocaleString('en-IN')}</Text>
                  </View>
                  <Pressable 
                    style={[styles.statBadge, styles.timeFilterBadge]}
                    onPress={() => setShowTimeFilterModal(true)}
                  >
                    <Ionicons name="time-outline" size={14} color="#5DADE2" />
                    <Text style={[styles.statText, styles.timeFilterText]}>{getTimeFilterLabel()}</Text>
                    <Ionicons name="chevron-down" size={12} color="#5DADE2" />
                  </Pressable>
                </View>
              </View>
              <View style={styles.headerRight}>
                <Pressable 
                  style={[styles.comparisonButton, styles.exportButton]}
                  onPress={handleExportToCSV}
                  disabled={isExporting}
                >
                  <Ionicons 
                    name={isExporting ? "refresh" : "download-outline"} 
                    size={16} 
                    color={isExporting ? "#9CA3AF" : "#2ECC71"} 
                  />
                  <Text style={[styles.comparisonButtonText, styles.exportButtonText]}>
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Text>
                </Pressable>
                <Pressable 
                  style={styles.comparisonButton}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Ionicons name="options-outline" size={18} color="#5DADE2" />
                  <Text style={styles.comparisonButtonText}>Compare</Text>
                </Pressable>
              </View>
            </View>

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
                  color={comparisonMode === 'all' ? "#5DADE2" : "#9CA3AF"} 
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
                  color={comparisonMode === 'selected' ? "#5DADE2" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.modeButtonText,
                  comparisonMode === 'selected' && styles.modeButtonTextActive,
                ]}>
                  Selected
                </Text>
              </Pressable>
            </View>

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
                        stroke="#1E1E1E"
                      />
                    ))}
                    <Circle
                      cx={CENTER}
                      cy={CENTER}
                      r={INNER_RADIUS - 5}
                      fill="#1E1E1E"
                      stroke="#2D2D2D"
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
                            color="#5DADE2" 
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
                  <View style={[styles.activeIcon, { backgroundColor: `${activeSegment.color}20` }]}>
                    <Ionicons name={getCategoryIcon(activeSegment.name) as any} size={16} color={activeSegment.color} />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.legendSection}>
              <View style={styles.legendHeader}>
                <View style={styles.legendTitleContainer}>
                  <Ionicons name="list-outline" size={18} color="#E0E0E0" />
                  <Text style={styles.legendTitle}>Categories</Text>
                </View>
                <View style={styles.selectionBadge}>
                  <Text style={styles.selectionBadgeText}>
                    {comparisonMode === 'selected' ? `${selectedCategories.length} selected` : 'All'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.categoryGrid}>
                {data.map((item, index) => {
                  const percentage = totalSpent > 0 ? Math.min((item.amount / totalSpent) * 100, 100) : 0;

                  return (
                    <Pressable
                      key={item.name}
                      onPress={() => {
                        Haptics.selectionAsync();
                        handleSegmentPress(index);
                      }}
                      style={styles.categoryRowWrapper}
                    >
                      <LinearGradient
                        colors={[item.lightColor, item.color]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.categoryRowCard}
                      >
                        <View style={styles.rowIcon}>
                          <Ionicons
                            name={getCategoryIcon(item.name) as any}
                            size={20}
                            color="#fff"
                          />
                        </View>

                        <View style={styles.rowCenter}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {item.name}
                          </Text>

                          <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { flex: percentage }]} />
                            <View style={{ flex: 100 - percentage }} />
                          </View>

                          <Text style={styles.rowSub}>
                            {percentage.toFixed(1)}% • {item.count} trx
                          </Text>
                        </View>

                        <Text style={styles.rowAmount}>
                          ₹{item.amount.toLocaleString('en-IN')}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {activeIndex !== null && (
              <View style={styles.hintContainer}>
                <Ionicons name="information-circle-outline" size={12} color="#5DADE2" />
                <Text style={styles.tapHint}>Tap anywhere to deselect</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Time Filter Modal */}
      <Modal
        visible={showTimeFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.timeFilterModalContent]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Time Period</Text>
                <Text style={styles.modalSubtitle}>
                  Filter expenses by year and month
                </Text>
              </View>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setShowTimeFilterModal(false)}
              >
                <Ionicons name="close" size={20} color="#E0E0E0" />
              </Pressable>
            </View>

            <ScrollView style={styles.timeFilterScroll}>
              <Pressable
                style={[
                  styles.timeFilterOption,
                  timeFilter === 'all' && styles.timeFilterOptionActive,
                ]}
                onPress={handleClearTimeFilter}
              >
                <View style={styles.timeFilterOptionIcon}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={20} 
                    color={timeFilter === 'all' ? "#5DADE2" : "#9CA3AF"} 
                  />
                </View>
                <View style={styles.timeFilterOptionText}>
                  <Text style={[
                    styles.timeFilterOptionTitle,
                    timeFilter === 'all' && styles.timeFilterOptionTitleActive,
                  ]}>
                    All Time
                  </Text>
                  <Text style={styles.timeFilterOptionSubtitle}>
                    Show all expenses
                  </Text>
                </View>
                {timeFilter === 'all' && (
                  <Ionicons name="checkmark-circle" size={20} color="#5DADE2" />
                )}
              </Pressable>

              <View style={styles.timeFilterSection}>
                <Text style={styles.timeFilterSectionTitle}>Select Year</Text>
                <View style={styles.yearGrid}>
                  {availableYears.map(year => (
                    <Pressable
                      key={year}
                      style={[
                        styles.yearButton,
                        selectedYear === year && styles.yearButtonActive,
                      ]}
                      onPress={() => handleYearSelect(year)}
                    >
                      <Text style={[
                        styles.yearButtonText,
                        selectedYear === year && styles.yearButtonTextActive,
                      ]}>
                        {year}
                      </Text>
                      {selectedYear === year && (
                        <View style={styles.yearButtonCheckmark}>
                          <Ionicons name="checkmark" size={12} color="#1E1E1E" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {selectedYear && (
                <View style={styles.timeFilterSection}>
                  <Text style={styles.timeFilterSectionTitle}>
                    Select Month for {selectedYear}
                  </Text>
                  <View style={styles.monthGrid}>
                    {availableMonths.length > 0 ? (
                      availableMonths.map(month => (
                        <Pressable
                          key={month}
                          style={[
                            styles.monthButton,
                            selectedMonth === month && styles.monthButtonActive,
                          ]}
                          onPress={() => handleMonthSelect(month)}
                        >
                          <Text style={[
                            styles.monthButtonText,
                            selectedMonth === month && styles.monthButtonTextActive,
                          ]}>
                            {getMonthName(month).substring(0, 3)}
                          </Text>
                          {selectedMonth === month && (
                            <View style={styles.monthButtonCheckmark}>
                              <Ionicons name="checkmark" size={10} color="#1E1E1E" />
                            </View>
                          )}
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>
                        No transactions for {selectedYear}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.timeFilterFooter}>
                <Pressable 
                  style={styles.applyTimeFilterButton}
                  onPress={() => setShowTimeFilterModal(false)}
                >
                  <Text style={styles.applyTimeFilterButtonText}>
                    Apply Filter
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                <Ionicons name="close" size={20} color="#E0E0E0" />
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={styles.modalActionButton} 
                onPress={selectAllCategories}
              >
                <Ionicons name="checkmark-done" size={16} color="#5DADE2" />
                <Text style={styles.modalActionButtonText}>Select All</Text>
              </Pressable>
              <Pressable 
                style={styles.modalActionButton} 
                onPress={clearAllCategories}
              >
                <Ionicons name="close-circle" size={16} color="#E74C3C" />
                <Text style={[styles.modalActionButtonText, styles.clearButtonText]}>Clear All</Text>
              </Pressable>
            </View>

            <ScrollView 
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
            >
              {availableCategories.map((category, index) => {
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
                        { backgroundColor: isSelected ? colors.main : '#374151' }
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={[styles.categoryIconContainer, { backgroundColor: `${colors.main}20` }]}>
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
                      <View style={[styles.categoryItemPercentageBadge, { backgroundColor: `${colors.main}20` }]}>
                        <Text style={[styles.categoryItemPercentageText, { color: colors.main }]}>
                          {percentage}%
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

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

// DARK THEME STYLES
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    minHeight: 400,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeFilterBadge: {
    backgroundColor: '#1A5276',
  },
  timeFilterText: {
    color: '#5DADE2',
    fontWeight: '600',
  },
  statText: {
    fontSize: 12,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  comparisonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A5276',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  exportButton: {
    backgroundColor: '#145A32',
  },
  exportButtonText: {
    color: '#2ECC71',
  },
  comparisonButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5DADE2',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  modeButtonTextActive: {
    color: '#5DADE2',
    fontWeight: '600',
  },
  chartSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: INNER_RADIUS * 2 - 10,
    height: INNER_RADIUS * 2 - 10,
  },
  centerAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  centerBadge: {
    backgroundColor: '#1A5276',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  centerPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5DADE2',
  },
  centerCategory: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
    maxWidth: INNER_RADIUS * 2 - 20,
  },
  totalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A5276',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  centerTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  centerLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    minWidth: CHART_SIZE,
  },
  activeColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  activeInfo: {
    flex: 1,
    marginRight: 10,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activePercentage: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  activeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  selectionBadge: {
    backgroundColor: '#1A5276',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5DADE2',
  },
  categoryGrid: {
    gap: 8,
  },
  categoryRowWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  categoryRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowCenter: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  rowSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
  },
  tapHint: {
    fontSize: 12,
    color: '#5DADE2',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  timeFilterModalContent: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeFilterScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  timeFilterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  timeFilterOptionActive: {
    backgroundColor: '#1A5276',
    borderColor: '#5DADE2',
  },
  timeFilterOptionIcon: {
    marginRight: 12,
  },
  timeFilterOptionText: {
    flex: 1,
  },
  timeFilterOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 2,
  },
  timeFilterOptionTitleActive: {
    color: '#5DADE2',
  },
  timeFilterOptionSubtitle: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  timeFilterSection: {
    marginBottom: 24,
  },
  timeFilterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 12,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  yearButtonActive: {
    backgroundColor: '#5DADE2',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  yearButtonTextActive: {
    color: '#1E1E1E',
  },
  yearButtonCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monthButtonActive: {
    backgroundColor: '#5DADE2',
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  monthButtonTextActive: {
    color: '#1E1E1E',
  },
  monthButtonCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  timeFilterFooter: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
  },
  applyTimeFilterButton: {
    backgroundColor: '#5DADE2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyTimeFilterButtonText: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  modalActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5DADE2',
  },
  clearButtonText: {
    color: '#E74C3C',
  },
  categoryList: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  categoryItemSelected: {
    backgroundColor: '#2D2D2D',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCheckboxSelected: {
    backgroundColor: '#5DADE2',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 2,
  },
  categoryItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryItemSubtext: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  categoryItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryItemPercentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryItemPercentageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    backgroundColor: '#2D2D2D',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  footerInfo: {
    marginBottom: 12,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 2,
  },
  totalText: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5DADE2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonDisabled: {
    backgroundColor: '#374151',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1E1E',
  },
});