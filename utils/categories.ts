

export const CATEGORY_RULES: Record<string, RegExp[]> = {
  // Income Categories
  "Income / Transfer In": [
    /salary/i,
    /income/i,
    /transfer.*in/i,
    /credit.*transfer/i,
    /deposit/i,
    /refund/i,
    /interest.*received/i,
    /dividend/i,
    /bonus/i,
    /reimbursement/i,
  ],

  // Recharge & Telecom
  Recharge: [
    /airtel/i,
    /jio/i,
    /vi/i,
    /vodafone/i,
    /idea/i,
    /bsnl/i,
    /recharge/i,
    /prepaid/i,
    /postpaid/i,
    /mobile.*bill/i,
    /phone.*bill/i,
    /telecom/i,
    /sim.*card/i,
    /mobile.*recharge/i,
  ],

  // Food & Dining
  "Food & Dining": [
    /zomato/i,
    /swiggy/i,
    /dominos/i,
    /pizza/i,
    /mcdonald/i,
    /mcd/i,
    /kfc/i,
    /restaurant/i,
    /cafe/i,
    /hotel/i,
    /eatfit/i,
    /food/i,
    /dining/i,
    /lunch/i,
    /dinner/i,
    /breakfast/i,
    /coffee/i,
    /starbucks/i,
    /burger/i,
    /subway/i,
    /foodpanda/i,
    /ubereats/i,
    /doordash/i,
    /grubhub/i,
    /bakery/i,
    /pastry/i,
    /ice.*cream/i,
    /dessert/i,
    /chai/i,
    /juice/i,
    /beverage/i,
    /bar/i,
    /pub/i,
    /buffet/i,
    /dhaba/i,
    /fast.*food/i,
    /street.*food/i,
  ],

  // Fuel & Gas
  Fuel: [
    /petrol/i,
    /diesel/i,
    /fuel/i,
    /oil/i,
    /indian.*oil/i,
    /hp.*petroleum/i,
    /hpcl/i,
    /bharat.*petroleum/i,
    /bpl/i,
    /shell/i,
    /gas/i,
    /cng/i,
    /lpg/i,
    /filling.*station/i,
    /gas.*station/i,
    /petrol.*pump/i,
  ],

  // Shopping
  Shopping: [
    /amazon/i,
    /flipkart/i,
    /myntra/i,
    /ajio/i,
    /meesho/i,
    /snapdeal/i,
    /store/i,
    /mart/i,
    /shopping/i,
    /purchase/i,
    /buy/i,
    /shop/i,
    /mall/i,
    /market/i,
    /emporium/i,
    /outlet/i,
    /bazaar/i,
    /retail/i,
    /supermarket/i,
    /hypermarket/i,
    /fashion/i,
    /clothing/i,
    /apparel/i,
    /footwear/i,
    /accessories/i,
    /electronics/i,
    /gadget/i,
    /appliance/i,
    /furniture/i,
    /home.*decor/i,
  ],

  // Groceries
  Groceries: [
    /bigbasket/i,
    /blinkit/i,
    /zepto/i,
    /instamart/i,
    /dmart/i,
    /grocery/i,
    /vegetable/i,
    /fruit/i,
    /kirana/i,
    /super.*market/i,
    /provision/i,
    /milk/i,
    /bread/i,
    /egg/i,
    /dairy/i,
    /meat/i,
    /fish/i,
    /poultry/i,
    /spices/i,
    /grains/i,
    /pulses/i,
    /rice/i,
    /wheat/i,
    /flour/i,
    /oil/i,
    /ghee/i,
    /snacks/i,
    /biscuit/i,
    /chocolate/i,
  ],

  // Travel & Transportation
  Travel: [
    /uber/i,
    /ola/i,
    /rapido/i,
    /irctc/i,
    /makemytrip/i,
    /yatra/i,
    /redbus/i,
    /travel/i,
    /transport/i,
    /taxi/i,
    /cab/i,
    /auto/i,
    /rickshaw/i,
    /bus/i,
    /train/i,
    /railway/i,
    /flight/i,
    /airline/i,
    /airport/i,
    /metro/i,
    /booking/i,
    /ticket/i,
    /hotel.*booking/i,
    /lodging/i,
    /accommodation/i,
    /tour/i,
    /tourism/i,
    /voyage/i,
    /journey/i,
    /commute/i,
  ],

  // Entertainment
  Entertainment: [
    /netflix/i,
    /prime/i,
    /hotstar/i,
    /spotify/i,
    /bookmyshow/i,
    /sony.*liv/i,
    /entertainment/i,
    /movie/i,
    /cinema/i,
    /theatre/i,
    /show/i,
    /concert/i,
    /event/i,
    /game/i,
    /gaming/i,
    /playstation/i,
    /xbox/i,
    /nintendo/i,
    /steam/i,
    /music/i,
    /streaming/i,
    /ott/i,
    /youtube.*premium/i,
    /disney.*plus/i,
    /hbo/i,
    /applemusic/i,
    /audible/i,
    /kindle/i,
    /magazine/i,
    /newspaper/i,
  ],

  // Utilities
  Utilities: [
    /electricity/i,
    /power/i,
    /water/i,
    /gas/i,
    /bill/i,
    /recharge/i,
    /utility/i,
    /internet/i,
    /wifi/i,
    /broadband/i,
    /cable/i,
    /dth/i,
    /set.*top.*box/i,
    /maintenance/i,
    /service.*charge/i,
    /property.*tax/i,
    /municipal.*tax/i,
    /housing/i,
    /rent/i,
    /house.*rent/i,
    /emi/i,
    /loan.*repayment/i,
    /insurance/i,
    /premium/i,
  ],

  // Education
  Education: [
    /udemy/i,
    /coursera/i,
    /byju/i,
    /unacademy/i,
    /college/i,
    /school/i,
    /exam/i,
    /education/i,
    /tuition/i,
    /coaching/i,
    /institute/i,
    /academy/i,
    /university/i,
    /course/i,
    /training/i,
    /workshop/i,
    /seminar/i,
    /certification/i,
    /books/i,
    /stationery/i,
    /pen/i,
    /pencil/i,
    /notebook/i,
    /laptop/i,
    /tablet/i,
    /educational/i,
    /learning/i,
  ],

  // Healthcare
  Healthcare: [
    /hospital/i,
    /clinic/i,
    /pharmacy/i,
    /apollo/i,
    /medplus/i,
    /1mg/i,
    /pharmeasy/i,
    /healthcare/i,
    /medical/i,
    /medicine/i,
    /doctor/i,
    /physician/i,
    /surgeon/i,
    /dentist/i,
    /optometrist/i,
    /lab/i,
    /test/i,
    /diagnostic/i,
    /wellness/i,
    /fitness/i,
    /gym/i,
    /yoga/i,
    /meditation/i,
    /vitamin/i,
    /supplement/i,
    /health.*insurance/i,
    /medical.*bill/i,
    /surgery/i,
    /treatment/i,
  ],

  // Banking & Finance
  "Banking & Finance": [
    /emi/i,
    /loan/i,
    /interest/i,
    /insurance/i,
    /mutual.*fund/i,
    /sip/i,
    /credit.*card/i,
    /banking/i,
    /finance/i,
    /investment/i,
    /stock/i,
    /share/i,
    /trading/i,
    /brokerage/i,
    /demate/i,
    /dividend/i,
    /fd.*interest/i,
    /fixed.*deposit/i,
    /recurring.*deposit/i,
    /tax/i,
    /gst/i,
    /income.*tax/i,
    /wealth.*management/i,
    /financial.*planning/i,
    /advisory/i,
    /consultancy/i,
    /audit/i,
    /accounting/i,
  ],

  // Transfer Out
  "Transfer Out": [
    /paid.*to/i,
    /transfer.*out/i,
    /sent.*to/i,
    /money.*sent/i,
    /upi.*payment/i,
    /imps/i,
    /neft/i,
    /rtgs/i,
    /wire.*transfer/i,
    /remittance/i,
    /gift/i,
    /donation/i,
    /charity/i,
    /contribution/i,
    /subscription/i,
    /membership/i,
  ],

  // Additional Categories for Better Coverage
  "Personal Care": [
    /salon/i,
    /spa/i,
    /beauty/i,
    /parlour/i,
    /barber/i,
    /haircut/i,
    /massage/i,
    /skincare/i,
    /cosmetic/i,
    /makeup/i,
    /perfume/i,
    /deodorant/i,
    /soap/i,
    /shampoo/i,
    /conditioner/i,
  ],

  "Home & Kitchen": [
    /home/i,
    /kitchen/i,
    /furnishing/i,
    /utensil/i,
    /cookware/i,
    /appliance/i,
    /cleaning/i,
    /detergent/i,
    /washing.*powder/i,
    /toiletries/i,
    /bathroom/i,
    /laundry/i,
    /repair/i,
    /maintenance/i,
    /renovation/i,
    /interior/i,
    /decoration/i,
  ],

  "Gifts & Donations": [
    /gift/i,
    /present/i,
    /donation/i,
    /charity/i,
    /contribution/i,
    /help/i,
    /aid/i,
    /ngo/i,
    /trust/i,
    /foundation/i,
  ],

  "Business Expenses": [
    /business/i,
    /office/i,
    /work/i,
    /professional/i,
    /client/i,
    /meeting/i,
    /conference/i,
    /travel.*business/i,
    /entertainment.*client/i,
    /corporate/i,
    /company/i,
    /enterprise/i,
  ],

  "Hobbies & Leisure": [
    /hobby/i,
    /leisure/i,
    /sports/i,
    /fitness/i,
    /gym/i,
    /yoga/i,
    /meditation/i,
    /photography/i,
    /painting/i,
    /drawing/i,
    /craft/i,
    /music.*lesson/i,
    /dance/i,
    /instrument/i,
    /garden/i,
    /plant/i,
  ],

  "Vehicle Maintenance": [
    /car.*service/i,
    /bike.*service/i,
    /vehicle.*repair/i,
    /tyre/i,
    /battery/i,
    /spare.*part/i,
    /insurance.*vehicle/i,
    /rc.*book/i,
    /puc/i,
    /washing.*car/i,
    /garage/i,
    /mechanic/i,
  ],

  "Child & Family": [
    /child/i,
    /baby/i,
    /kid/i,
    /toys/i,
    /diaper/i,
    /school.*fee/i,
    /tuition.*fee/i,
    /activity.*class/i,
    /play.*school/i,
    /family/i,
    /relative/i,
    /marriage/i,
    /wedding/i,
    /celebration/i,
    /festival/i,
  ],

  "Technology & Software": [
    /software/i,
    /app/i,
    /subscription/i,
    /license/i,
    /domain/i,
    /hosting/i,
    /cloud/i,
    /server/i,
    /website/i,
    /developer/i,
    /programming/i,
    /tool/i,
    /equipment/i,
    /gadget/i,
    /accessory/i,
  ],
};

// Category Colors for Visualization
export const CATEGORY_COLORS: Record<string, string> = {
  "Income / Transfer In": "#10B981", // Green
  "Recharge": "#3B82F6", // Blue
  "Food & Dining": "#EF4444", // Red
  "Fuel": "#F59E0B", // Amber
  "Shopping": "#8B5CF6", // Violet
  "Groceries": "#EC4899", // Pink
  "Travel": "#06B6D4", // Cyan
  "Entertainment": "#F97316", // Orange
  "Utilities": "#6366F1", // Indigo
  "Education": "#14B8A6", // Teal
  "Healthcare": "#EF4444", // Red (different shade)
  "Banking & Finance": "#84CC16", // Lime
  "Transfer Out": "#64748B", // Slate
  "Personal Care": "#D946EF", // Fuchsia
  "Home & Kitchen": "#F43F5E", // Rose
  "Gifts & Donations": "#0EA5E9", // Sky
  "Business Expenses": "#8B5CF6", // Purple
  "Hobbies & Leisure": "#22C55E", // Green
  "Vehicle Maintenance": "#F59E0B", // Yellow
  "Child & Family": "#EC4899", // Pink
  "Technology & Software": "#3B82F6", // Blue
  "Other Expense": "#6B7280", // Gray
};

// Category Icons for UI
export const CATEGORY_ICONS: Record<string, string> = {
  "Income / Transfer In": "💰",
  "Recharge": "📱",
  "Food & Dining": "🍕",
  "Fuel": "⛽",
  "Shopping": "🛍️",
  "Groceries": "🛒",
  "Travel": "✈️",
  "Entertainment": "🎬",
  "Utilities": "💡",
  "Education": "📚",
  "Healthcare": "🏥",
  "Banking & Finance": "🏦",
  "Transfer Out": "↗️",
  "Personal Care": "💇",
  "Home & Kitchen": "🏠",
  "Gifts & Donations": "🎁",
  "Business Expenses": "💼",
  "Hobbies & Leisure": "⚽",
  "Vehicle Maintenance": "🚗",
  "Child & Family": "👶",
  "Technology & Software": "💻",
  "Other Expense": "❓",
};

// Category Description
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Income / Transfer In": "Salary, transfers, refunds, and other income",
  "Recharge": "Mobile recharges, phone bills, and telecom services",
  "Food & Dining": "Restaurants, food delivery, cafes, and dining out",
  "Fuel": "Petrol, diesel, gas, and vehicle fuel expenses",
  "Shopping": "Online and offline shopping, fashion, electronics",
  "Groceries": "Daily groceries, vegetables, fruits, and household items",
  "Travel": "Transportation, taxis, flights, hotels, and travel bookings",
  "Entertainment": "Movies, OTT subscriptions, games, and leisure activities",
  "Utilities": "Electricity, water, gas, internet, and utility bills",
  "Education": "Courses, tuition, books, and educational materials",
  "Healthcare": "Medical bills, medicines, hospital visits, and health services",
  "Banking & Finance": "Loans, insurance, investments, and financial services",
  "Transfer Out": "Money transfers, UPI payments, and sent money",
  "Personal Care": "Salon, spa, beauty, and personal grooming",
  "Home & Kitchen": "Home supplies, kitchen items, and household maintenance",
  "Gifts & Donations": "Gifts, donations, charity, and contributions",
  "Business Expenses": "Work-related expenses and professional costs",
  "Hobbies & Leisure": "Sports, fitness, hobbies, and leisure activities",
  "Vehicle Maintenance": "Car/bike service, repairs, and maintenance",
  "Child & Family": "Child expenses, family events, and celebrations",
  "Technology & Software": "Software subscriptions, gadgets, and tech expenses",
  "Other Expense": "Miscellaneous and uncategorized expenses",
};

// Helper function to categorize a transaction
export function categorizeTransaction(description: string, transactionType: string): string {
  const desc = description.toLowerCase();
  
  // First check for credit transactions
  if (transactionType === "CREDIT") {
    return "Income / Transfer In";
  }
  
  // Check each category
  for (const [category, patterns] of Object.entries(CATEGORY_RULES)) {
    for (const pattern of patterns) {
      if (pattern.test(desc)) {
        return category;
      }
    }
  }
  
  // Default category
  return "Other Expense";
}

// Get all categories for selection
export const ALL_CATEGORIES = Object.keys(CATEGORY_RULES);

// Get categories with data (for comparison feature)
export function getCategoriesWithData(transactions: any[]): string[] {
  const categories = new Set<string>();
  transactions.forEach(transaction => {
    const category = categorizeTransaction(transaction.description, transaction.type);
    categories.add(category);
  });
  return Array.from(categories);
}