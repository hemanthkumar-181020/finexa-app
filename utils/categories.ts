export const CATEGORY_RULES: Record<string, RegExp[]> = {
  Food: [/swiggy/i, /zomato/i, /restaurant/i, /hotel/i, /cafe/i],
  Transport: [/uber/i, /ola/i, /rapido/i, /bus/i, /metro/i],
  Shopping: [/amazon/i, /flipkart/i, /myntra/i],
  Bills: [/electricity/i, /recharge/i, /wifi/i, /airtel/i, /jio/i],
  Salary: [/salary/i, /payroll/i],
};
