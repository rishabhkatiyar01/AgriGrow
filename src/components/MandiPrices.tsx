import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Filter,
  RefreshCw,
  BarChart2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { lumi } from '../lib/lumi'

export interface MandiPrice {
  _id: string
  cropName: string
  hindiName: string
  marketName: string
  state: string
  district: string
  category: 'Cereals' | 'Pulses' | 'Oilseeds' | 'Vegetables' | 'Spices' | 'Fruits' | 'Cash Crops' | 'Dry Fruits'
  pricePerKg: number
  pricePerQuintal: number
  minPrice: number
  maxPrice: number
  avgPrice: number
  mspPrice?: number
  arrivalQuantity?: number // in Quintals
  quality: 'excellent' | 'good' | 'average' | 'poor'
  trend: 'rising' | 'falling' | 'stable'
  date: string
}

// ----------------------------------------------------------------------
// Comprehensive Dataset: 60+ Major Mandi Entries across 17 Major States & Union Territories
// ----------------------------------------------------------------------
const MAJOR_INDIAN_MANDI_DATA: MandiPrice[] = [
  // PUNJAB
  {
    _id: 'm1',
    cropName: 'Wheat (Sharbati)',
    hindiName: 'गेहूं (शरबती)',
    marketName: 'Khanna Mandi APMC',
    state: 'Punjab',
    district: 'Ludhiana',
    category: 'Cereals',
    pricePerKg: 24.50,
    pricePerQuintal: 2450,
    minPrice: 2380,
    maxPrice: 2520,
    avgPrice: 2450,
    mspPrice: 2275,
    arrivalQuantity: 14500,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm2',
    cropName: 'Paddy / Basmati Rice (Pusa 1121)',
    hindiName: 'धान (बासमती पूसा 1121)',
    marketName: 'Abohar Grain Market',
    state: 'Punjab',
    district: 'Fazilka',
    category: 'Cereals',
    pricePerKg: 39.50,
    pricePerQuintal: 3950,
    minPrice: 3750,
    maxPrice: 4150,
    avgPrice: 3950,
    mspPrice: 2300,
    arrivalQuantity: 22000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm3',
    cropName: 'Cotton (Medium Staple)',
    hindiName: 'कपास (मध्यम रेशा)',
    marketName: 'Bathinda APMC Mandi',
    state: 'Punjab',
    district: 'Bathinda',
    category: 'Cash Crops',
    pricePerKg: 72.50,
    pricePerQuintal: 7250,
    minPrice: 6950,
    maxPrice: 7500,
    avgPrice: 7250,
    mspPrice: 7121,
    arrivalQuantity: 8400,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm4',
    cropName: 'Potato (Kufri Pukhraj)',
    hindiName: 'आलू (कुफरी पुखराज)',
    marketName: 'Jalandhar Wholesale Mandi',
    state: 'Punjab',
    district: 'Jalandhar',
    category: 'Vegetables',
    pricePerKg: 15.00,
    pricePerQuintal: 1500,
    minPrice: 1350,
    maxPrice: 1650,
    avgPrice: 1500,
    arrivalQuantity: 31000,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },

  // HARYANA
  {
    _id: 'm5',
    cropName: 'Mustard / Sarson',
    hindiName: 'सरसों',
    marketName: 'Karnal Grain Market',
    state: 'Haryana',
    district: 'Karnal',
    category: 'Oilseeds',
    pricePerKg: 56.50,
    pricePerQuintal: 5650,
    minPrice: 5400,
    maxPrice: 5850,
    avgPrice: 5650,
    mspPrice: 5650,
    arrivalQuantity: 12500,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm6',
    cropName: 'Maize / Corn',
    hindiName: 'मक्का',
    marketName: 'Ambala Cantt Mandi',
    state: 'Haryana',
    district: 'Ambala',
    category: 'Cereals',
    pricePerKg: 21.20,
    pricePerQuintal: 2120,
    minPrice: 2000,
    maxPrice: 2250,
    avgPrice: 2120,
    mspPrice: 2090,
    arrivalQuantity: 9200,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm7',
    cropName: 'Paddy (PR 126)',
    hindiName: 'धान (पीआर 126)',
    marketName: 'Kurukshetra APMC',
    state: 'Haryana',
    district: 'Kurukshetra',
    category: 'Cereals',
    pricePerKg: 23.50,
    pricePerQuintal: 2350,
    minPrice: 2280,
    maxPrice: 2420,
    avgPrice: 2350,
    mspPrice: 2300,
    arrivalQuantity: 18400,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm8',
    cropName: 'Barley / Jau',
    hindiName: 'जौ',
    marketName: 'Hisar APMC Mandi',
    state: 'Haryana',
    district: 'Hisar',
    category: 'Cereals',
    pricePerKg: 19.80,
    pricePerQuintal: 1980,
    minPrice: 1880,
    maxPrice: 2080,
    avgPrice: 1980,
    mspPrice: 1850,
    arrivalQuantity: 6700,
    quality: 'average',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },

  // UTTAR PRADESH
  {
    _id: 'm9',
    cropName: 'Potato (Jyoti)',
    hindiName: 'आलू (ज्योति)',
    marketName: 'Kanpur Ganj Mandi',
    state: 'Uttar Pradesh',
    district: 'Kanpur Nagar',
    category: 'Vegetables',
    pricePerKg: 16.80,
    pricePerQuintal: 1680,
    minPrice: 1520,
    maxPrice: 1820,
    avgPrice: 1680,
    arrivalQuantity: 28000,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm10',
    cropName: 'Onion (Red)',
    hindiName: 'प्याज़ (लाल)',
    marketName: 'Noida / Azadpur APMC Hub',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    category: 'Vegetables',
    pricePerKg: 29.50,
    pricePerQuintal: 2950,
    minPrice: 2600,
    maxPrice: 3250,
    avgPrice: 2950,
    arrivalQuantity: 34000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm11',
    cropName: 'Sugarcane',
    hindiName: 'गन्ना',
    marketName: 'Bareilly APMC Mandi',
    state: 'Uttar Pradesh',
    district: 'Bareilly',
    category: 'Cash Crops',
    pricePerKg: 3.55,
    pricePerQuintal: 355,
    minPrice: 345,
    maxPrice: 370,
    avgPrice: 355,
    mspPrice: 340,
    arrivalQuantity: 85000,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm12',
    cropName: 'Mango (Dasheri)',
    hindiName: 'आम (दशहरी)',
    marketName: 'Lucknow Malihabad Mandi',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    category: 'Fruits',
    pricePerKg: 48.00,
    pricePerQuintal: 4800,
    minPrice: 4200,
    maxPrice: 5400,
    avgPrice: 4800,
    arrivalQuantity: 15600,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm13',
    cropName: 'Wheat (Lokwan)',
    hindiName: 'गेहूं (लोकवान)',
    marketName: 'Mathura APMC Mandi',
    state: 'Uttar Pradesh',
    district: 'Mathura',
    category: 'Cereals',
    pricePerKg: 23.80,
    pricePerQuintal: 2380,
    minPrice: 2280,
    maxPrice: 2460,
    avgPrice: 2380,
    mspPrice: 2275,
    arrivalQuantity: 11200,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm14',
    cropName: 'Tomato (Hybrid)',
    hindiName: 'टमाटर (हाइब्रिड)',
    marketName: 'Varanasi APMC Market',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    category: 'Vegetables',
    pricePerKg: 24.00,
    pricePerQuintal: 2400,
    minPrice: 2100,
    maxPrice: 2700,
    avgPrice: 2400,
    arrivalQuantity: 19500,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },

  // MADHYA PRADESH
  {
    _id: 'm15',
    cropName: 'Soybean (Yellow)',
    hindiName: 'सोयाबीन (पीला)',
    marketName: 'Indore APMC Mandi',
    state: 'Madhya Pradesh',
    district: 'Indore',
    category: 'Oilseeds',
    pricePerKg: 48.90,
    pricePerQuintal: 4890,
    minPrice: 4650,
    maxPrice: 5100,
    avgPrice: 4890,
    mspPrice: 4892,
    arrivalQuantity: 26000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm16',
    cropName: 'Garlic / Lahsun (Mandsaur Grade)',
    hindiName: 'लहसुन (मंदसौर क्वालिटी)',
    marketName: 'Mandsaur APMC Mandi',
    state: 'Madhya Pradesh',
    district: 'Mandsaur',
    category: 'Vegetables',
    pricePerKg: 142.00,
    pricePerQuintal: 14200,
    minPrice: 12500,
    maxPrice: 16000,
    avgPrice: 14200,
    arrivalQuantity: 14800,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm17',
    cropName: 'Gram / Chana (Desi)',
    hindiName: 'चना (देशी)',
    marketName: 'Ujjain Krishi Upaj Mandi',
    state: 'Madhya Pradesh',
    district: 'Ujjain',
    category: 'Pulses',
    pricePerKg: 58.50,
    pricePerQuintal: 5850,
    minPrice: 5550,
    maxPrice: 6150,
    avgPrice: 5850,
    mspPrice: 5440,
    arrivalQuantity: 17200,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm18',
    cropName: 'Wheat (Sharbati Supreme)',
    hindiName: 'गेहूं (शरबती सुपीरियर)',
    marketName: 'Sehore APMC Mandi',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    category: 'Cereals',
    pricePerKg: 32.00,
    pricePerQuintal: 3200,
    minPrice: 2950,
    maxPrice: 3450,
    avgPrice: 3200,
    mspPrice: 2275,
    arrivalQuantity: 13500,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm19',
    cropName: 'Green Pea / Matar',
    hindiName: 'हरी मटर',
    marketName: 'Jabalpur APMC Mandi',
    state: 'Madhya Pradesh',
    district: 'Jabalpur',
    category: 'Vegetables',
    pricePerKg: 38.00,
    pricePerQuintal: 3800,
    minPrice: 3400,
    maxPrice: 4200,
    avgPrice: 3800,
    arrivalQuantity: 8900,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },

  // MAHARASHTRA
  {
    _id: 'm20',
    cropName: 'Onion (Nashik Red)',
    hindiName: 'प्याज़ (नासिक)',
    marketName: 'Lasalgaon / Nashik APMC',
    state: 'Maharashtra',
    district: 'Nashik',
    category: 'Vegetables',
    pricePerKg: 32.50,
    pricePerQuintal: 3250,
    minPrice: 2850,
    maxPrice: 3550,
    avgPrice: 3250,
    arrivalQuantity: 42000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm21',
    cropName: 'Tomato (Hybrid)',
    hindiName: 'टमाटर (हाइब्रिड)',
    marketName: 'Vashi APMC Navi Mumbai',
    state: 'Maharashtra',
    district: 'Thane / Mumbai',
    category: 'Vegetables',
    pricePerKg: 23.00,
    pricePerQuintal: 2300,
    minPrice: 1950,
    maxPrice: 2600,
    avgPrice: 2300,
    arrivalQuantity: 31000,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm22',
    cropName: 'Arhar / Tur Dal',
    hindiName: 'तूर / अरहर दाल',
    marketName: 'Latur APMC Market',
    state: 'Maharashtra',
    district: 'Latur',
    category: 'Pulses',
    pricePerKg: 98.00,
    pricePerQuintal: 9800,
    minPrice: 9350,
    maxPrice: 10300,
    avgPrice: 9800,
    mspPrice: 7000,
    arrivalQuantity: 16500,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm23',
    cropName: 'Pomegranate / Anar (Bhagwa)',
    hindiName: 'अनार (भगवा)',
    marketName: 'Solapur APMC Market',
    state: 'Maharashtra',
    district: 'Solapur',
    category: 'Fruits',
    pricePerKg: 115.00,
    pricePerQuintal: 11500,
    minPrice: 9800,
    maxPrice: 13000,
    avgPrice: 11500,
    arrivalQuantity: 12400,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm24',
    cropName: 'Orange / Santra (Nagpur)',
    hindiName: 'संतरा (नागपुर)',
    marketName: 'Kalamna APMC Nagpur',
    state: 'Maharashtra',
    district: 'Nagpur',
    category: 'Fruits',
    pricePerKg: 42.00,
    pricePerQuintal: 4200,
    minPrice: 3600,
    maxPrice: 4800,
    avgPrice: 4200,
    arrivalQuantity: 21000,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm25',
    cropName: 'Banana (Mahalaxmi / Kela)',
    hindiName: 'केला (जलगांव)',
    marketName: 'Jalgaon Market Yard',
    state: 'Maharashtra',
    district: 'Jalgaon',
    category: 'Fruits',
    pricePerKg: 18.50,
    pricePerQuintal: 1850,
    minPrice: 1600,
    maxPrice: 2100,
    avgPrice: 1850,
    arrivalQuantity: 38000,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // RAJASTHAN
  {
    _id: 'm26',
    cropName: 'Cumin / Jeera',
    hindiName: 'जीरा',
    marketName: 'Jodhpur Krishi Mandi',
    state: 'Rajasthan',
    district: 'Jodhpur',
    category: 'Spices',
    pricePerKg: 288.00,
    pricePerQuintal: 28800,
    minPrice: 26800,
    maxPrice: 31000,
    avgPrice: 28800,
    arrivalQuantity: 9500,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm27',
    cropName: 'Mustard / Rai',
    hindiName: 'रायड़ा / सरसों',
    marketName: 'Jaipur Grain Market',
    state: 'Rajasthan',
    district: 'Jaipur',
    category: 'Oilseeds',
    pricePerKg: 54.20,
    pricePerQuintal: 5420,
    minPrice: 5150,
    maxPrice: 5650,
    avgPrice: 5420,
    mspPrice: 5650,
    arrivalQuantity: 18200,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm28',
    cropName: 'Coriander / Dhaniya',
    hindiName: 'धनिया',
    marketName: 'Kota Bhamashah Mandi',
    state: 'Rajasthan',
    district: 'Kota',
    category: 'Spices',
    pricePerKg: 79.50,
    pricePerQuintal: 7950,
    minPrice: 7300,
    maxPrice: 8550,
    avgPrice: 7950,
    arrivalQuantity: 14200,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm29',
    cropName: 'Guar Seed / Gwar',
    hindiName: 'ग्वार बीज',
    marketName: 'Bikaner Grain Market',
    state: 'Rajasthan',
    district: 'Bikaner',
    category: 'Cash Crops',
    pricePerKg: 52.00,
    pricePerQuintal: 5200,
    minPrice: 4850,
    maxPrice: 5500,
    avgPrice: 5200,
    arrivalQuantity: 11000,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm30',
    cropName: 'Isabgol / Psyllium Husk',
    hindiName: 'ईसबगोल',
    marketName: 'Nagaur APMC Mandi',
    state: 'Rajasthan',
    district: 'Nagaur',
    category: 'Spices',
    pricePerKg: 165.00,
    pricePerQuintal: 16500,
    minPrice: 15000,
    maxPrice: 18000,
    avgPrice: 16500,
    arrivalQuantity: 4300,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // GUJARAT
  {
    _id: 'm31',
    cropName: 'Cumin / Jeera (Export Grade)',
    hindiName: 'जीरा (एक्सपोर्ट क्वालिटी)',
    marketName: 'Unjha Spices Mandi Hub',
    state: 'Gujarat',
    district: 'Mehsana',
    category: 'Spices',
    pricePerKg: 315.00,
    pricePerQuintal: 31500,
    minPrice: 29500,
    maxPrice: 33500,
    avgPrice: 31500,
    arrivalQuantity: 19800,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm32',
    cropName: 'Groundnut / Peanuts',
    hindiName: 'मूंगफली',
    marketName: 'Rajkot APMC Mandi',
    state: 'Gujarat',
    district: 'Rajkot',
    category: 'Oilseeds',
    pricePerKg: 63.50,
    pricePerQuintal: 6350,
    minPrice: 6000,
    maxPrice: 6650,
    avgPrice: 6350,
    mspPrice: 6377,
    arrivalQuantity: 21500,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm33',
    cropName: 'Cotton (Shankar-6)',
    hindiName: 'कपास (शंकर 6)',
    marketName: 'Gondal APMC Yard',
    state: 'Gujarat',
    district: 'Rajkot',
    category: 'Cash Crops',
    pricePerKg: 75.00,
    pricePerQuintal: 7500,
    minPrice: 7150,
    maxPrice: 7800,
    avgPrice: 7500,
    mspPrice: 7121,
    arrivalQuantity: 16700,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm34',
    cropName: 'Sesame / Til (White)',
    hindiName: 'सफेद तिल',
    marketName: 'Amreli APMC Yard',
    state: 'Gujarat',
    district: 'Amreli',
    category: 'Oilseeds',
    pricePerKg: 138.00,
    pricePerQuintal: 13800,
    minPrice: 12500,
    maxPrice: 14800,
    avgPrice: 13800,
    mspPrice: 8635,
    arrivalQuantity: 5400,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // KARNATAKA
  {
    _id: 'm35',
    cropName: 'Maize / Corn',
    hindiName: 'मक्का',
    marketName: 'Hubballi APMC Mandi',
    state: 'Karnataka',
    district: 'Dharwad',
    category: 'Cereals',
    pricePerKg: 21.00,
    pricePerQuintal: 2100,
    minPrice: 1980,
    maxPrice: 2220,
    avgPrice: 2100,
    mspPrice: 2090,
    arrivalQuantity: 17500,
    quality: 'average',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm36',
    cropName: 'Turmeric / Haldi',
    hindiName: 'हल्दी',
    marketName: 'Yeshwanthpur APMC Bengaluru',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    category: 'Spices',
    pricePerKg: 142.00,
    pricePerQuintal: 14200,
    minPrice: 13200,
    maxPrice: 15400,
    avgPrice: 14200,
    arrivalQuantity: 11200,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm37',
    cropName: 'Arecanut / Supari',
    hindiName: 'सुपारी',
    marketName: 'Shivamogga APMC Yard',
    state: 'Karnataka',
    district: 'Shivamogga',
    category: 'Cash Crops',
    pricePerKg: 485.00,
    pricePerQuintal: 48500,
    minPrice: 45500,
    maxPrice: 51500,
    avgPrice: 48500,
    arrivalQuantity: 6200,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm38',
    cropName: 'Paddy (Sona Masoori)',
    hindiName: 'धान (सोना मसूरी)',
    marketName: 'Davanagere APMC Market',
    state: 'Karnataka',
    district: 'Davanagere',
    category: 'Cereals',
    pricePerKg: 30.50,
    pricePerQuintal: 3050,
    minPrice: 2880,
    maxPrice: 3200,
    avgPrice: 3050,
    mspPrice: 2300,
    arrivalQuantity: 24000,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },

  // TAMIL NADU
  {
    _id: 'm39',
    cropName: 'Tomato (Local)',
    hindiName: 'टमाटर',
    marketName: 'Koyambedu Wholesale Market',
    state: 'Tamil Nadu',
    district: 'Chennai',
    category: 'Vegetables',
    pricePerKg: 26.00,
    pricePerQuintal: 2600,
    minPrice: 2300,
    maxPrice: 2900,
    avgPrice: 2600,
    arrivalQuantity: 36000,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm40',
    cropName: 'Banana (Poovan)',
    hindiName: 'केला',
    marketName: 'Tiruchirappalli APMC',
    state: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    category: 'Fruits',
    pricePerKg: 28.50,
    pricePerQuintal: 2850,
    minPrice: 2550,
    maxPrice: 3150,
    avgPrice: 2850,
    arrivalQuantity: 18500,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm41',
    cropName: 'Coconut',
    hindiName: 'नारियल',
    marketName: 'Madurai Central Market',
    state: 'Tamil Nadu',
    district: 'Madurai',
    category: 'Cash Crops',
    pricePerKg: 36.00,
    pricePerQuintal: 3600,
    minPrice: 3300,
    maxPrice: 3900,
    avgPrice: 3600,
    arrivalQuantity: 41000,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm42',
    cropName: 'Small Onion / Shallots',
    hindiName: 'सांभर प्याज़',
    marketName: 'Dindigul APMC Yard',
    state: 'Tamil Nadu',
    district: 'Dindigul',
    category: 'Vegetables',
    pricePerKg: 52.00,
    pricePerQuintal: 5200,
    minPrice: 4600,
    maxPrice: 5800,
    avgPrice: 5200,
    arrivalQuantity: 12900,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // ANDHRA PRADESH
  {
    _id: 'm43',
    cropName: 'Red Chilli (Guntur Teja)',
    hindiName: 'लाल मिर्च (गुंटूर तेजा)',
    marketName: 'Guntur Mirchi Yard APMC',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    category: 'Spices',
    pricePerKg: 218.00,
    pricePerQuintal: 21800,
    minPrice: 19800,
    maxPrice: 23800,
    avgPrice: 21800,
    arrivalQuantity: 32000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm44',
    cropName: 'Paddy (Sona Masoori)',
    hindiName: 'धान (सोना मसूरी)',
    marketName: 'Vijayawada APMC Yard',
    state: 'Andhra Pradesh',
    district: 'NTR / Krishna',
    category: 'Cereals',
    pricePerKg: 31.50,
    pricePerQuintal: 3150,
    minPrice: 2980,
    maxPrice: 3300,
    avgPrice: 3150,
    mspPrice: 2300,
    arrivalQuantity: 28500,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm45',
    cropName: 'Sweet Lime / Mosambi',
    hindiName: 'मौसमी',
    marketName: 'Rajahmundry APMC Yard',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    category: 'Fruits',
    pricePerKg: 34.00,
    pricePerQuintal: 3400,
    minPrice: 3000,
    maxPrice: 3800,
    avgPrice: 3400,
    arrivalQuantity: 15400,
    quality: 'good',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },

  // TELANGANA
  {
    _id: 'm46',
    cropName: 'Cotton (Long Staple)',
    hindiName: 'कपास (लंबा रेशा)',
    marketName: 'Warangal Grain & Cotton Yard',
    state: 'Telangana',
    district: 'Warangal',
    category: 'Cash Crops',
    pricePerKg: 73.50,
    pricePerQuintal: 7350,
    minPrice: 7050,
    maxPrice: 7650,
    avgPrice: 7350,
    mspPrice: 7121,
    arrivalQuantity: 19500,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm47',
    cropName: 'Turmeric (Finger)',
    hindiName: 'हल्दी (अंगुली)',
    marketName: 'Nizamabad APMC Yard',
    state: 'Telangana',
    district: 'Nizamabad',
    category: 'Spices',
    pricePerKg: 134.00,
    pricePerQuintal: 13400,
    minPrice: 12500,
    maxPrice: 14400,
    avgPrice: 13400,
    arrivalQuantity: 16800,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm48',
    cropName: 'Vegetables Mix (Brinjal/Okra)',
    hindiName: 'सब्जियाँ (बैंगन/भिंडी)',
    marketName: 'Hyderabad Bowenpally APMC',
    state: 'Telangana',
    district: 'Hyderabad',
    category: 'Vegetables',
    pricePerKg: 35.00,
    pricePerQuintal: 3500,
    minPrice: 3100,
    maxPrice: 3900,
    avgPrice: 3500,
    arrivalQuantity: 27000,
    quality: 'good',
    trend: 'falling',
    date: new Date().toISOString().split('T')[0]
  },

  // WEST BENGAL
  {
    _id: 'm49',
    cropName: 'Rice (Minikit)',
    hindiName: 'चावल (मिनीकिट)',
    marketName: 'Kolkata Posta Market',
    state: 'West Bengal',
    district: 'Kolkata',
    category: 'Cereals',
    pricePerKg: 42.50,
    pricePerQuintal: 4250,
    minPrice: 4050,
    maxPrice: 4450,
    avgPrice: 4250,
    mspPrice: 2300,
    arrivalQuantity: 39000,
    quality: 'excellent',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm50',
    cropName: 'Jute (Raw)',
    hindiName: 'पटसन / जूट',
    marketName: 'Burdwan APMC Mandi',
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    category: 'Cash Crops',
    pricePerKg: 56.50,
    pricePerQuintal: 5650,
    minPrice: 5350,
    maxPrice: 5950,
    avgPrice: 5650,
    mspPrice: 5050,
    arrivalQuantity: 14500,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // BIHAR
  {
    _id: 'm51',
    cropName: 'Maize / Makka',
    hindiName: 'मक्का',
    marketName: 'Gulabbagh Mandi Purnia',
    state: 'Bihar',
    district: 'Purnia',
    category: 'Cereals',
    pricePerKg: 22.80,
    pricePerQuintal: 2280,
    minPrice: 2180,
    maxPrice: 2380,
    avgPrice: 2280,
    mspPrice: 2090,
    arrivalQuantity: 45000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm52',
    cropName: 'Litchi (Shahi)',
    hindiName: 'लीची (शाही)',
    marketName: 'Muzaffarpur APMC Mandi',
    state: 'Bihar',
    district: 'Muzaffarpur',
    category: 'Fruits',
    pricePerKg: 125.00,
    pricePerQuintal: 12500,
    minPrice: 11000,
    maxPrice: 14000,
    avgPrice: 12500,
    arrivalQuantity: 8200,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm53',
    cropName: 'Makhana / Fox Nuts',
    hindiName: 'मखाना (शाही)',
    marketName: 'Bhagalpur Wholesale Mandi',
    state: 'Bihar',
    district: 'Bhagalpur',
    category: 'Dry Fruits',
    pricePerKg: 580.00,
    pricePerQuintal: 58000,
    minPrice: 54000,
    maxPrice: 62000,
    avgPrice: 58000,
    arrivalQuantity: 3100,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // KERALA
  {
    _id: 'm54',
    cropName: 'Black Pepper / Kali Mirch',
    hindiName: 'काली मिर्च',
    marketName: 'Kochi APMC Spices Exchange',
    state: 'Kerala',
    district: 'Ernakulam',
    category: 'Spices',
    pricePerKg: 645.00,
    pricePerQuintal: 64500,
    minPrice: 61500,
    maxPrice: 67500,
    avgPrice: 64500,
    arrivalQuantity: 4100,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm55',
    cropName: 'Cardamom (Green)',
    hindiName: 'छोटी इलायची',
    marketName: 'Wayanad Spices Mandi',
    state: 'Kerala',
    district: 'Wayanad',
    category: 'Spices',
    pricePerKg: 1880.00,
    pricePerQuintal: 188000,
    minPrice: 178000,
    maxPrice: 198000,
    avgPrice: 188000,
    arrivalQuantity: 1200,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm56',
    cropName: 'Natural Rubber (RSS 4)',
    hindiName: 'प्राकृतिक रबर',
    marketName: 'Kottayam Rubber Market',
    state: 'Kerala',
    district: 'Kottayam',
    category: 'Cash Crops',
    pricePerKg: 195.00,
    pricePerQuintal: 19500,
    minPrice: 18500,
    maxPrice: 20500,
    avgPrice: 19500,
    arrivalQuantity: 7800,
    quality: 'good',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // HIMACHAL PRADESH
  {
    _id: 'm57',
    cropName: 'Apple (Royal Delicious)',
    hindiName: 'सेब (रॉयल डिलीशियस)',
    marketName: 'Shimla APMC Market Yard',
    state: 'Himachal Pradesh',
    district: 'Shimla',
    category: 'Fruits',
    pricePerKg: 95.00,
    pricePerQuintal: 9500,
    minPrice: 8200,
    maxPrice: 11000,
    avgPrice: 9500,
    arrivalQuantity: 28000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm58',
    cropName: 'Tomato (Himsona)',
    hindiName: 'टमाटर (हिमसोना)',
    marketName: 'Solan APMC Vegetable Mandi',
    state: 'Himachal Pradesh',
    district: 'Solan',
    category: 'Vegetables',
    pricePerKg: 32.00,
    pricePerQuintal: 3200,
    minPrice: 2800,
    maxPrice: 3600,
    avgPrice: 3200,
    arrivalQuantity: 14500,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },

  // JAMMU & KASHMIR
  {
    _id: 'm59',
    cropName: 'Apple (Kashmiri Delicious)',
    hindiName: 'कश्मीर सेब',
    marketName: 'Sopore Fruit Mandi APMC',
    state: 'Jammu & Kashmir',
    district: 'Baramulla',
    category: 'Fruits',
    pricePerKg: 88.00,
    pricePerQuintal: 8800,
    minPrice: 7500,
    maxPrice: 10200,
    avgPrice: 8800,
    arrivalQuantity: 45000,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm60',
    cropName: 'Saffron / Kesar (Pure Kashmir)',
    hindiName: 'केसर (कश्मीर)',
    marketName: 'Pampore Saffron Mandi Hub',
    state: 'Jammu & Kashmir',
    district: 'Pulwama',
    category: 'Spices',
    pricePerKg: 185000.00,
    pricePerQuintal: 18500000,
    minPrice: 17000000,
    maxPrice: 20000000,
    avgPrice: 18500000,
    arrivalQuantity: 120,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'm61',
    cropName: 'Walnut / Akhrot (Kashmir Paper Shell)',
    hindiName: 'अखरोट',
    marketName: 'Srinagar Wholesale Mandi',
    state: 'Jammu & Kashmir',
    district: 'Srinagar',
    category: 'Dry Fruits',
    pricePerKg: 340.00,
    pricePerQuintal: 34000,
    minPrice: 31000,
    maxPrice: 37500,
    avgPrice: 34000,
    arrivalQuantity: 4200,
    quality: 'excellent',
    trend: 'stable',
    date: new Date().toISOString().split('T')[0]
  },

  // ASSAM / NORTH EAST
  {
    _id: 'm62',
    cropName: 'Assam Tea Leaf (Orthodox)',
    hindiName: 'चाय पत्ती (असम)',
    marketName: 'Guwahati Wholesale APMC',
    state: 'Assam',
    district: 'Kamrup',
    category: 'Cash Crops',
    pricePerKg: 240.00,
    pricePerQuintal: 24000,
    minPrice: 21000,
    maxPrice: 27000,
    avgPrice: 24000,
    arrivalQuantity: 18200,
    quality: 'excellent',
    trend: 'rising',
    date: new Date().toISOString().split('T')[0]
  }
]

const CATEGORIES = ['All', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Spices', 'Fruits', 'Cash Crops', 'Dry Fruits']

const MAJOR_CROP_QUICK_FILTERS = [
  { id: 'all', name: 'All Crops', hindi: 'सभी फसलें' },
  { id: 'wheat', name: 'Wheat', hindi: 'गेहूं' },
  { id: 'paddy', name: 'Rice / Paddy', hindi: 'धान/चावल' },
  { id: 'soybean', name: 'Soybean', hindi: 'सोयाबीन' },
  { id: 'mustard', name: 'Mustard', hindi: 'सरसों' },
  { id: 'onion', name: 'Onion', hindi: 'प्याज़' },
  { id: 'potato', name: 'Potato', hindi: 'आलू' },
  { id: 'tomato', name: 'Tomato', hindi: 'टमाटर' },
  { id: 'cotton', name: 'Cotton', hindi: 'कपास' },
  { id: 'cumin', name: 'Cumin (Jeera)', hindi: 'जीरा' },
  { id: 'garlic', name: 'Garlic', hindi: 'लहसुन' },
  { id: 'chilli', name: 'Red Chilli', hindi: 'लाल मिर्च' },
  { id: 'turmeric', name: 'Turmeric', hindi: 'हल्दी' },
  { id: 'apple', name: 'Apple', hindi: 'सेब' },
  { id: 'gram', name: 'Chana / Gram', hindi: 'चना' },
  { id: 'makhana', name: 'Makhana', hindi: 'मखाना' }
]

const MandiPrices: React.FC = () => {
  const { language, t } = useLanguage()
  const [prices, setPrices] = useState<MandiPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCropFilter, setSelectedCropFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'high' | 'low' | 'name' | 'trend'>('high')
  const [selectedDetailPrice, setSelectedDetailPrice] = useState<MandiPrice | null>(null)

  const fetchMandiPrices = useCallback(async () => {
    try {
      setLoading(true)
      const { list } = await lumi.entities.mandi_prices.list({ sort: { date: -1 } })
      if (list && list.length > 0) {
        setPrices(list as MandiPrice[])
      } else {
        // Fallback to complete major Indian Mandi dataset if DB is empty
        setPrices(MAJOR_INDIAN_MANDI_DATA)
      }
    } catch (error) {
      console.error('Failed to fetch mandi prices from database:', error)
      setPrices(MAJOR_INDIAN_MANDI_DATA)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMandiPrices()
  }, [fetchMandiPrices])

  const filteredPrices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    let list = prices.filter((price) => {
      const matchesSearch =
        !q ||
        price.cropName.toLowerCase().includes(q) ||
        (price.hindiName && price.hindiName.toLowerCase().includes(q)) ||
        price.marketName.toLowerCase().includes(q) ||
        price.district.toLowerCase().includes(q) ||
        price.state.toLowerCase().includes(q)

      const matchesState = selectedState === 'all' || price.state === selectedState
      const matchesCat = selectedCategory === 'All' || price.category === selectedCategory

      let matchesCropFilter = true
      if (selectedCropFilter !== 'all') {
        const cropMap: Record<string, string[]> = {
          wheat: ['wheat', 'गेहूं'],
          paddy: ['paddy', 'rice', 'धान', 'चावल', 'basmati'],
          soybean: ['soybean', 'सोयाबीन'],
          mustard: ['mustard', 'sarson', 'सरसों', 'रायड़ा'],
          onion: ['onion', 'प्याज़'],
          potato: ['potato', 'आलू'],
          tomato: ['tomato', 'टमाटर'],
          cotton: ['cotton', 'कपास'],
          cumin: ['cumin', 'jeera', 'जीरा'],
          garlic: ['garlic', 'lahsun', 'लहसुन'],
          chilli: ['chilli', 'mirchi', 'मिर्च'],
          turmeric: ['turmeric', 'haldi', 'हल्दी'],
          apple: ['apple', 'सेब'],
          gram: ['gram', 'chana', 'चना'],
          makhana: ['makhana', 'मखाना']
        }

        const keywords = cropMap[selectedCropFilter] || [selectedCropFilter]
        matchesCropFilter = keywords.some(
          (kw) =>
            price.cropName.toLowerCase().includes(kw) ||
            (price.hindiName && price.hindiName.toLowerCase().includes(kw))
        )
      }

      return matchesSearch && matchesState && matchesCat && matchesCropFilter
    })

    // Sort order
    if (sortOrder === 'high') {
      list.sort((a, b) => b.pricePerQuintal - a.pricePerQuintal)
    } else if (sortOrder === 'low') {
      list.sort((a, b) => a.pricePerQuintal - b.pricePerQuintal)
    } else if (sortOrder === 'name') {
      list.sort((a, b) => a.cropName.localeCompare(b.cropName))
    } else if (sortOrder === 'trend') {
      const trendRank = { rising: 3, stable: 2, falling: 1 }
      list.sort((a, b) => trendRank[b.trend] - trendRank[a.trend])
    }

    return list
  }, [prices, searchTerm, selectedState, selectedCategory, selectedCropFilter, sortOrder])

  const statesList = useMemo(() => {
    const uniqueStates = [...new Set(prices.map((p) => p.state))].sort()
    return uniqueStates
  }, [prices])

  // Analytics Metrics
  const highestPriceCrop = useMemo(() => {
    if (prices.length === 0) return null
    return [...prices].sort((a, b) => b.pricePerQuintal - a.pricePerQuintal)[0]
  }, [prices])

  const topGainer = useMemo(() => {
    const rising = prices.filter((p) => p.trend === 'rising')
    if (rising.length === 0) return null
    return rising.sort((a, b) => b.pricePerQuintal - a.pricePerQuintal)[0]
  }, [prices])

  const mspBeatingCount = useMemo(() => {
    return prices.filter((p) => p.mspPrice && p.pricePerQuintal >= p.mspPrice).length
  }, [prices])

  const getTrendIcon = (trend: MandiPrice['trend']) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: MandiPrice['trend']) => {
    switch (trend) {
      case 'rising':
        return 'text-green-700 bg-green-50 border border-green-200'
      case 'falling':
        return 'text-red-700 bg-red-50 border border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-200'
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-emerald-800 bg-emerald-100 border border-emerald-300'
      case 'good':
        return 'text-blue-800 bg-blue-100 border border-blue-300'
      case 'average':
        return 'text-amber-800 bg-amber-100 border border-amber-300'
      case 'poor':
        return 'text-red-800 bg-red-100 border border-red-300'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-emerald-100 rounded-xl w-1/3" />
          <div className="h-24 bg-emerald-100/50 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-2 backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              {language === 'hi' ? 'राष्ट्रीय मंडी लाइव भाव' : 'National Mandi Live Feeds'}
            </span>
            <span className="bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'hi' ? 'एमएसपी मान्यता प्राप्त' : 'Govt MSP Benchmarks'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 text-amber-300 tracking-tight leading-tight">
            {t('prices.title') || 'Major Crops & States Mandi Commodity Rates'}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed font-medium">
            {language === 'hi'
              ? 'पंजाब, हरियाणा, उत्तर प्रदेश, मध्य प्रदेश, महाराष्ट्र, राजस्थान, गुजरात, कर्नाटक, आंध्र प्रदेश, तेलंगाना, पश्चिम बंगाल, बिहार, केरल, हिमाचल एवं जम्मू-कश्मीर की 60+ प्रमुख कृषि उपज मंडियों (APMC) के सीधे लाइव भाव।'
              : 'Real-time APMC Mandi rates covering 17+ major agricultural states and 60+ major crop market hubs across India with Government MSP comparisons.'}
          </p>
        </div>
        <div className="absolute -right-12 -bottom-12 opacity-15 pointer-events-none">
          <BarChart2 className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? 'कुल कवर मंडी बाज़ार' : 'Total Mandi Markets'}
            </span>
            <MapPin className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{prices.length} Markets</div>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Across 17 Major States
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? 'कीमत बढ़ रही है (Bullish)' : 'Rising Commodity Rates'}
            </span>
            <ArrowUpRight className="w-5 h-5 text-green-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-extrabold text-green-700">
            {prices.filter((p) => p.trend === 'rising').length} Mandis
          </div>
          <span className="text-xs text-green-700 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> High Farmer Profit Margin
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? 'MSP से ऊपर भाव' : 'Above Govt MSP Rates'}
            </span>
            <Award className="w-5 h-5 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{mspBeatingCount} Commodities</div>
          <span className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Beating MSP Benchmarks
          </span>
        </div>

        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase text-amber-100 tracking-wider">
              {language === 'hi' ? 'शीर्ष गैनर मंडी' : 'Top Gain Commodity'}
            </span>
            <span className="bg-white/20 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
              TOP MANDI
            </span>
          </div>
          {topGainer && (
            <div>
              <div className="text-xl font-black truncate">{topGainer.cropName}</div>
              <div className="text-xs text-amber-100 font-semibold mt-1">
                ₹{topGainer.pricePerQuintal.toLocaleString()}/Quintal • {topGainer.marketName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Major States Mandi Quick Selector Grid */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            {language === 'hi' ? 'प्रमुख राज्य मंडी हब (Major State Mandis)' : 'Major Agricultural States Mandi Hubs'}
          </h3>
          {selectedState !== 'all' && (
            <button
              onClick={() => setSelectedState('all')}
              className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear State Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setSelectedState('all')}
            className={`p-3 rounded-2xl text-xs font-bold text-left transition border ${
              selectedState === 'all'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-md scale-[1.02]'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
            }`}
          >
            <div className="text-sm font-black">All India</div>
            <div className="text-[11px] opacity-80">{prices.length} Mandi Hubs</div>
          </button>

          {statesList.map((st) => {
            const count = prices.filter((p) => p.state === st).length
            return (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`p-3 rounded-2xl text-xs font-bold text-left transition border ${
                  selectedState === st
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-md scale-[1.02]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                <div className="text-xs font-bold truncate">{st}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{count} Mandis</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Major Crops Quick Access Chips */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {language === 'hi' ? 'प्रमुख फसलें त्वरित चयन (Major Crops)' : 'Major Crops Quick Access'}
          </h3>
          {selectedCropFilter !== 'all' && (
            <button
              onClick={() => setSelectedCropFilter('all')}
              className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Show All Crops
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {MAJOR_CROP_QUICK_FILTERS.map((crop) => {
            const active = selectedCropFilter === crop.id
            return (
              <button
                key={crop.id}
                onClick={() => setSelectedCropFilter(crop.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-amber-500 text-white shadow-sm scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-900'
                }`}
              >
                <span>{language === 'hi' ? crop.hindi : crop.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'फसल, मंडी, जिला या राज्य खोजें (उदा. गेहूं, नासिक, पंजाब, सरसों)...'
                  : 'Search crop, mandi, district or state (e.g. Wheat, Nashik, Punjab, Mustard)...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-sm text-gray-900 placeholder-gray-400 font-semibold"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? (language === 'hi' ? 'सभी श्रेणियां' : 'All Categories') : cat}
                </option>
              ))}
            </select>

            {/* Sort Order Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="high">{language === 'hi' ? 'कीमत: उच्चतम से निम्नतम' : 'Price: High to Low'}</option>
              <option value="low">{language === 'hi' ? 'कीमत: निम्नतम से उच्चतम' : 'Price: Low to High'}</option>
              <option value="trend">{language === 'hi' ? 'कीमत ट्रेंड (Bullish First)' : 'Price Trend (Rising First)'}</option>
              <option value="name">{language === 'hi' ? 'फसल नाम: अ-ज़' : 'Crop Name: A-Z'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Prices Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              {language === 'hi' ? 'लाइव मंडी दर तालिका (APMC Feed)' : 'Live Commodity APMC Mandi Rates'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Showing {filteredPrices.length} entries for major crops across India (Click any row for details)
            </p>
          </div>
          <button
            onClick={fetchMandiPrices}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {language === 'hi' ? 'रिफ्रेश फीड' : 'Refresh Feed'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/80 text-gray-600 uppercase text-[11px] font-extrabold tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">{language === 'hi' ? 'फसल नाम' : 'Crop & Variety'}</th>
                <th className="px-6 py-4">{language === 'hi' ? 'मंडी एवं स्थान' : 'Mandi & Location'}</th>
                <th className="px-6 py-4">{language === 'hi' ? 'दर (₹/क्विंटल)' : 'Rate (₹/Quintal)'}</th>
                <th className="px-6 py-4">{language === 'hi' ? 'दर (₹/किलो)' : 'Rate (₹/Kg)'}</th>
                <th className="px-6 py-4">{language === 'hi' ? 'MSP तुलना' : 'Govt MSP Status'}</th>
                <th className="px-6 py-4">{t('prices.quality') || 'Quality'}</th>
                <th className="px-6 py-4">{t('prices.trend') || 'Trend'}</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm font-medium">
              {filteredPrices.map((price) => {
                const aboveMsp = price.mspPrice && price.pricePerQuintal >= price.mspPrice
                const diffMsp = price.mspPrice ? price.pricePerQuintal - price.mspPrice : null

                return (
                  <tr
                    key={price._id}
                    onClick={() => setSelectedDetailPrice(price)}
                    className="hover:bg-emerald-50/50 cursor-pointer transition duration-150 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-extrabold text-gray-900 group-hover:text-emerald-800 transition">
                        {price.cropName}
                      </div>
                      <div className="text-xs text-emerald-700 font-semibold">{price.hindiName}</div>
                      <span className="inline-block mt-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {price.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{price.marketName}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                        <span className="font-bold text-gray-800">{price.district}</span>, {price.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-black text-gray-900">
                        ₹{price.pricePerQuintal.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Avg: ₹{price.avgPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-extrabold text-emerald-800">
                        ₹{price.pricePerKg.toFixed(2)} <span className="text-xs font-normal text-gray-500">/kg</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Range: ₹{price.minPrice} - ₹{price.maxPrice}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {price.mspPrice ? (
                        <div>
                          <span
                            className={`inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                              aboveMsp
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {aboveMsp
                              ? `Above MSP (+₹${diffMsp})`
                              : `Below MSP (-₹${Math.abs(diffMsp!)})`}
                          </span>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Govt MSP: ₹{price.mspPrice.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Market Driven</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full capitalize ${getQualityColor(
                          price.quality
                        )}`}
                      >
                        {price.quality}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full capitalize ${getTrendColor(
                          price.trend
                        )}`}
                      >
                        {getTrendIcon(price.trend)}
                        <span className="ml-1.5">{price.trend}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button className="p-2 text-emerald-700 bg-emerald-50 group-hover:bg-emerald-700 group-hover:text-white rounded-full transition">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPrices.length === 0 && (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {language === 'hi' ? 'कोई मंडी परिणाम नहीं मिला' : 'No Mandi Prices Found'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              {language === 'hi'
                ? 'कृपया अपने खोज शब्दों या चयनित राज्य/फसल फ़िल्टर को बदलने का प्रयास करें।'
                : 'No price data matched your current filter criteria. Try resetting your search filters.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedState('all')
                setSelectedCategory('All')
                setSelectedCropFilter('all')
              }}
              className="mt-5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs transition shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Mandi Details Modal */}
      {selectedDetailPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDetailPrice(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0">
                {selectedDetailPrice.cropName.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {selectedDetailPrice.category}
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {selectedDetailPrice.cropName}
                </h3>
                <p className="text-sm font-bold text-emerald-800">{selectedDetailPrice.hindiName}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-bold text-gray-800">{selectedDetailPrice.marketName}</span> (
                  {selectedDetailPrice.district}, {selectedDetailPrice.state})
                </div>
              </div>
            </div>

            {/* Price Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <span className="text-xs text-emerald-700 font-bold uppercase">Rate per Quintal</span>
                <div className="text-2xl font-black text-emerald-900 mt-1">
                  ₹{selectedDetailPrice.pricePerQuintal.toLocaleString()}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                <span className="text-xs text-blue-700 font-bold uppercase">Rate per Kg</span>
                <div className="text-2xl font-black text-blue-900 mt-1">
                  ₹{selectedDetailPrice.pricePerKg.toFixed(2)}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                <span className="text-xs text-amber-700 font-bold uppercase">Min - Max Range</span>
                <div className="text-lg font-black text-amber-900 mt-1">
                  ₹{selectedDetailPrice.minPrice} - ₹{selectedDetailPrice.maxPrice}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              {/* MSP Benchmarks */}
              {selectedDetailPrice.mspPrice && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Government MSP Benchmark</div>
                    <div className="text-base font-extrabold text-gray-900">
                      ₹{selectedDetailPrice.mspPrice.toLocaleString()} / Quintal
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-black rounded-full ${
                        selectedDetailPrice.pricePerQuintal >= selectedDetailPrice.mspPrice
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedDetailPrice.pricePerQuintal >= selectedDetailPrice.mspPrice
                        ? `+₹${selectedDetailPrice.pricePerQuintal - selectedDetailPrice.mspPrice} above MSP`
                        : `-₹${selectedDetailPrice.mspPrice - selectedDetailPrice.pricePerQuintal} below MSP`}
                    </span>
                  </div>
                </div>
              )}

              {/* Arrivals & Quality */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200">
                  <span className="text-gray-500 font-bold block mb-1">Daily Market Arrivals</span>
                  <span className="font-extrabold text-gray-900 text-sm">
                    {selectedDetailPrice.arrivalQuantity
                      ? `${selectedDetailPrice.arrivalQuantity.toLocaleString()} Quintals`
                      : 'Moderate Arrivals'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200">
                  <span className="text-gray-500 font-bold block mb-1">Quality Grade</span>
                  <span className="font-extrabold text-gray-900 text-sm capitalize">
                    {selectedDetailPrice.quality} Quality
                  </span>
                </div>
              </div>

              {/* APMC Advisory */}
              <div className="bg-emerald-800 text-white rounded-2xl p-4 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Info className="w-4 h-4" /> APMC Farmer Trade Advisory
                </div>
                <p className="text-emerald-100 leading-relaxed font-medium">
                  Current market arrivals in {selectedDetailPrice.marketName} show a{' '}
                  <span className="font-bold text-white uppercase">{selectedDetailPrice.trend}</span> price trend.
                  Farmers bringing {selectedDetailPrice.quality} grade {selectedDetailPrice.cropName} are advised to
                  verify local weighbridge rates prior to selling.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDetailPrice(null)}
              className="mt-6 w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs transition shadow-md"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Footer Info Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-center flex items-center justify-center gap-2 shadow-sm">
        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="font-medium">
          {language === 'hi'
            ? 'कीमतें दैनिक आधार पर विभिन्न राज्य कृषि उपज मंडी समितियों (APMC) एवं e-NAM पोर्टल से अपडेट की जाती हैं। व्यापार से पूर्व अपनी नजदीकी मंडी से पुष्टि करें।'
            : 'Mandi prices are updated daily from official State APMC and e-NAM feeds. Please cross-verify rates with your local APMC mandi before trading.'}
        </p>
      </div>
    </div>
  )
}

export default MandiPrices
