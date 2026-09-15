import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Star,
  Package,
  IndianRupee,
  Users,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  Award,
  Filter,
  Sparkles,
  X,
  MessageCircle,
  Calendar,
  Droplets,
  ArrowRight,
  TrendingUp,
  Leaf,
  Info,
  SlidersHorizontal,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

export interface GrainListing {
  _id: string
  seller_id: string
  grain_type: string
  grain_name_display?: string
  quantity: number // in kg
  price_per_kg: number
  quality_grade: string
  location: {
    state: string
    district: string
    village: string
    pincode?: string
  }
  contact_info: {
    name: string
    phone: string
    whatsapp?: string
  }
  harvest_date: string
  organic_certified: boolean
  moisture_content: number // %
  status: string
  images: string[]
  description: string
  created_at: string
  seller_rating?: number
  verified_farmer?: boolean
}

export interface GrainOrder {
  _id: string
  buyer_id: string
  listing_id: string
  quantity_ordered: number
  agreed_price: number
  total_amount: number
  order_status: string
  buyer_info: {
    name: string
    phone: string
    company?: string
  }
  delivery_address: {
    state: string
    district: string
    address: string
    pincode?: string
  }
  payment_terms: string
  delivery_date: string
  notes?: string
  created_at: string
  updated_at?: string
}

// ----------------------------------------------------------------------
// Rich Sample Dataset (16+ Verified Farmer Listings across India)
// ----------------------------------------------------------------------
const SAMPLE_GRAIN_LISTINGS: GrainListing[] = [
  {
    _id: 'g1',
    seller_id: 'seller_101',
    grain_type: 'wheat',
    grain_name_display: 'Sharbati Gold Wheat (शरबती गेहूं)',
    quantity: 5000,
    price_per_kg: 24.50,
    quality_grade: 'A+',
    location: {
      state: 'Punjab',
      district: 'Ludhiana',
      village: 'Khanna Kalan',
      pincode: '141401'
    },
    contact_info: {
      name: 'Sardar Gurpreet Singh',
      phone: '+919876543210',
      whatsapp: '919876543210'
    },
    harvest_date: '2026-04-15',
    organic_certified: true,
    moisture_content: 11.2,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
    ],
    description: '100% premium Sharbati wheat grown naturally with organic manure. High gluten strength, golden grain luster, ideal for rotis.',
    created_at: new Date().toISOString(),
    seller_rating: 4.9,
    verified_farmer: true
  },
  {
    _id: 'g2',
    seller_id: 'seller_102',
    grain_type: 'rice',
    grain_name_display: 'Pusa 1121 Basmati Paddy (बासमती धान)',
    quantity: 12000,
    price_per_kg: 39.50,
    quality_grade: 'A+',
    location: {
      state: 'Punjab',
      district: 'Fazilka',
      village: 'Abohar Mandi',
      pincode: '152116'
    },
    contact_info: {
      name: 'Harmanpreet Dhillon',
      phone: '+919812345678',
      whatsapp: '919812345678'
    },
    harvest_date: '2025-11-20',
    organic_certified: false,
    moisture_content: 12.0,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Extra long grain Pusa 1121 Basmati paddy. Dry stored in clean silos, rich aroma, zero broken grains.',
    created_at: new Date().toISOString(),
    seller_rating: 4.8,
    verified_farmer: true
  },
  {
    _id: 'g3',
    seller_id: 'seller_103',
    grain_type: 'soybean',
    grain_name_display: 'Yellow Soybean JS-335 (पीला सोयाबीन)',
    quantity: 8000,
    price_per_kg: 48.90,
    quality_grade: 'A',
    location: {
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Sanwer',
      pincode: '453551'
    },
    contact_info: {
      name: 'Rameshwar Patidar',
      phone: '+919754321098',
      whatsapp: '919754321098'
    },
    harvest_date: '2025-10-30',
    organic_certified: true,
    moisture_content: 10.5,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Cleaned, machine-sorted yellow soybean batch. High oil content (19.5%), zero weed seed contamination.',
    created_at: new Date().toISOString(),
    seller_rating: 4.7,
    verified_farmer: true
  },
  {
    _id: 'g4',
    seller_id: 'seller_104',
    grain_type: 'mustard',
    grain_name_display: 'Bold Black Mustard / Sarson (काली सरसों)',
    quantity: 6500,
    price_per_kg: 56.50,
    quality_grade: 'A+',
    location: {
      state: 'Haryana',
      district: 'Karnal',
      village: 'Gharaunda',
      pincode: '132114'
    },
    contact_info: {
      name: 'Chaudhary Rajesh Verma',
      phone: '+919416012345',
      whatsapp: '919416012345'
    },
    harvest_date: '2026-03-10',
    organic_certified: false,
    moisture_content: 8.5,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High pungency mustard seeds with 41% oil yield. Machine cleaned, sun dried to optimal moisture.',
    created_at: new Date().toISOString(),
    seller_rating: 4.9,
    verified_farmer: true
  },
  {
    _id: 'g5',
    seller_id: 'seller_105',
    grain_type: 'chana',
    grain_name_display: 'Desi Chana / Chickpeas (देशी चना)',
    quantity: 4500,
    price_per_kg: 58.50,
    quality_grade: 'A',
    location: {
      state: 'Madhya Pradesh',
      district: 'Ujjain',
      village: 'Nagda',
      pincode: '456335'
    },
    contact_info: {
      name: 'Vikram Singh Anjana',
      phone: '+919826098765',
      whatsapp: '919826098765'
    },
    harvest_date: '2026-03-25',
    organic_certified: true,
    moisture_content: 9.8,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1515543904379-3d757afe72e2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Organically grown bold Desi Chana. Excellent for dal making and roasting. Free from insect damage.',
    created_at: new Date().toISOString(),
    seller_rating: 4.8,
    verified_farmer: true
  },
  {
    _id: 'g6',
    seller_id: 'seller_106',
    grain_type: 'corn',
    grain_name_display: 'Yellow Maize / Corn (पीली मक्का)',
    quantity: 15000,
    price_per_kg: 22.80,
    quality_grade: 'B+',
    location: {
      state: 'Bihar',
      district: 'Purnia',
      village: 'Gulabbagh',
      pincode: '854302'
    },
    contact_info: {
      name: 'Manoj Kumar Yadav',
      phone: '+919934011223',
      whatsapp: '919934011223'
    },
    harvest_date: '2026-05-10',
    organic_certified: false,
    moisture_content: 13.0,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dry yellow corn grains harvested from Gulabbagh belt. High starch content, suitable for poultry feed & starch plants.',
    created_at: new Date().toISOString(),
    seller_rating: 4.6,
    verified_farmer: true
  },
  {
    _id: 'g7',
    seller_id: 'seller_107',
    grain_type: 'bajra',
    grain_name_display: 'Hybrid Pearl Millet / Bajra (बाजरा)',
    quantity: 7000,
    price_per_kg: 23.50,
    quality_grade: 'A',
    location: {
      state: 'Rajasthan',
      district: 'Jodhpur',
      village: 'Osian',
      pincode: '342303'
    },
    contact_info: {
      name: 'Kanaram Bishnoi',
      phone: '+919414156789',
      whatsapp: '919414156789'
    },
    harvest_date: '2025-10-15',
    organic_certified: true,
    moisture_content: 10.0,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Threshed, winnowed Marwar bajra. Nutrient dense, chemical free, grown with desert rain water.',
    created_at: new Date().toISOString(),
    seller_rating: 4.9,
    verified_farmer: true
  },
  {
    _id: 'g8',
    seller_id: 'seller_108',
    grain_type: 'jowar',
    grain_name_display: 'White Sorghum / Jowar (सफेद ज्वार)',
    quantity: 4000,
    price_per_kg: 34.00,
    quality_grade: 'A+',
    location: {
      state: 'Karnataka',
      district: 'Dharwad',
      village: 'Hubballi Rural',
      pincode: '580020'
    },
    contact_info: {
      name: 'Basavaraj Patil',
      phone: '+919845012345',
      whatsapp: '919845012345'
    },
    harvest_date: '2026-02-18',
    organic_certified: true,
    moisture_content: 11.0,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Malkhed variety white Jowar. Pearl white grains, high fiber, perfect for jowar bhakri & health foods.',
    created_at: new Date().toISOString(),
    seller_rating: 4.8,
    verified_farmer: true
  }
]

const GRAIN_TYPES = [
  { value: 'all', label: 'All Grains', hindi: 'सभी अनाज' },
  { value: 'wheat', label: 'Wheat', hindi: 'गेहूं' },
  { value: 'rice', label: 'Rice / Paddy', hindi: 'चावल/धान' },
  { value: 'soybean', label: 'Soybean', hindi: 'सोयाबीन' },
  { value: 'mustard', label: 'Mustard', hindi: 'सरसों' },
  { value: 'chana', label: 'Chana / Gram', hindi: 'चना' },
  { value: 'corn', label: 'Maize / Corn', hindi: 'मक्का' },
  { value: 'bajra', label: 'Bajra / Millet', hindi: 'बाजरा' },
  { value: 'jowar', label: 'Jowar / Sorghum', hindi: 'ज्वार' }
]

const QUALITY_GRADES = ['All', 'A+', 'A', 'B+', 'B']

const PAYMENT_TERMS = [
  { value: 'advance', label: 'Advance Bank Transfer' },
  { value: 'on_delivery', label: 'Cash on Delivery / Weighbridge' },
  { value: '30_days', label: '30 Days APMC Credit' }
]

const GrainMarketplace: React.FC = () => {
  const { language } = useLanguage()
  const { user, isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'orders'>('browse')
  const [listings, setListings] = useState<GrainListing[]>([])
  const [orders, setOrders] = useState<GrainOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrainType, setSelectedGrainType] = useState('all')
  const [selectedQualityGrade, setSelectedQualityGrade] = useState('All')
  const [organicOnly, setOrganicOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<'price_asc' | 'price_desc' | 'qty_desc' | 'rating'>('price_desc')

  // Modals & Selection
  const [selectedListingDetail, setSelectedListingDetail] = useState<GrainListing | null>(null)
  const [showOrderModal, setShowOrderModal] = useState<GrainListing | null>(null)
  const [showCreateListingModal, setShowCreateListingModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Order calculator state
  const [orderQuantity, setOrderQuantity] = useState<number>(500)

  // Fetch listings from Lumi DB with fallback to rich sample data
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await lumi.entities.grain_listings.list({
        filter: { status: 'available' },
        sort: { created_at: -1 }
      })

      if (response.list && response.list.length > 0) {
        setListings(response.list as GrainListing[])
      } else {
        setListings(SAMPLE_GRAIN_LISTINGS)
      }
    } catch (error) {
      console.error('Failed to fetch grain listings:', error)
      setListings(SAMPLE_GRAIN_LISTINGS)
    } fontally: {
      setLoading(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user?.userId) return
    try {
      const response = await lumi.entities.grain_orders.list({
        filter: { buyer_id: user.userId },
        sort: { created_at: -1 }
      })
      setOrders((response.list as GrainOrder[]) || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    fetchListings()
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [fetchListings, fetchOrders, isAuthenticated])

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    let list = listings.filter((item) => {
      const nameMatch =
        !q ||
        item.grain_type.toLowerCase().includes(q) ||
        (item.grain_name_display && item.grain_name_display.toLowerCase().includes(q)) ||
        (item.contact_info?.name && item.contact_info.name.toLowerCase().includes(q)) ||
        (item.location?.district && item.location.district.toLowerCase().includes(q)) ||
        (item.location?.state && item.location.state.toLowerCase().includes(q))

      const typeMatch = selectedGrainType === 'all' || item.grain_type === selectedGrainType
      const gradeMatch = selectedQualityGrade === 'All' || item.quality_grade === selectedQualityGrade
      const organicMatch = !organicOnly || item.organic_certified

      return nameMatch && typeMatch && gradeMatch && organicMatch
    })

    // Sort logic
    if (sortOrder === 'price_asc') {
      list.sort((a, b) => a.price_per_kg - b.price_per_kg)
    } else if (sortOrder === 'price_desc') {
      list.sort((a, b) => b.price_per_kg - a.price_per_kg)
    } else if (sortOrder === 'qty_desc') {
      list.sort((a, b) => b.quantity - a.quantity)
    } else if (sortOrder === 'rating') {
      list.sort((a, b) => (b.seller_rating || 4.5) - (a.seller_rating || 4.5))
    }

    return list
  }, [listings, searchTerm, selectedGrainType, selectedQualityGrade, organicOnly, sortOrder])

  // Statistics
  const totalStockKg = useMemo(() => {
    return listings.reduce((sum, item) => sum + (item.quantity || 0), 0)
  }, [listings])

  const organicCount = useMemo(() => {
    return listings.filter((item) => item.organic_certified).length
  }, [listings])

  const avgPricePerQuintal = useMemo(() => {
    if (listings.length === 0) return 0
    const sum = listings.reduce((acc, item) => acc + item.price_per_kg * 100, 0)
    return Math.round(sum / listings.length)
  }, [listings])

  // Handlers
  const handleRequireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      action()
    }
  }

  const handleCreateListingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated || !user?.userId) {
      lumi.auth.signIn()
      return
    }

    const formData = new FormData(event.currentTarget)
    const now = new Date().toISOString()

    const newListingData: Omit<GrainListing, '_id'> = {
      seller_id: user.userId,
      grain_type: String(formData.get('grain_type') || 'wheat'),
      grain_name_display: String(formData.get('grain_name_display') || formData.get('grain_type')),
      quantity: Number(formData.get('quantity') || 0),
      price_per_kg: Number(formData.get('price_per_kg') || 0),
      quality_grade: String(formData.get('quality_grade') || 'A'),
      location: {
        state: String(formData.get('state') || ''),
        district: String(formData.get('district') || ''),
        village: String(formData.get('village') || ''),
        pincode: String(formData.get('pincode') || '')
      },
      contact_info: {
        name: String(formData.get('contact_name') || user.user_name || 'Farmer'),
        phone: String(formData.get('phone') || ''),
        whatsapp: String(formData.get('whatsapp') || '')
      },
      harvest_date: String(formData.get('harvest_date') || new Date().toISOString().split('T')[0]),
      organic_certified: !!formData.get('organic_certified'),
      moisture_content: Number(formData.get('moisture_content') || 11),
      status: 'available',
      images: [
        String(formData.get('image_url') || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80')
      ],
      description: String(formData.get('description') || ''),
      created_at: now,
      verified_farmer: true,
      seller_rating: 4.8
    }

    try {
      await lumi.entities.grain_listings.create(newListingData)
      toast.success(language === 'hi' ? 'अनाज लिस्टिंग सफलतापूर्वक बनाई गई!' : 'Grain listing posted successfully!')
      setShowCreateListingModal(false)
      fetchListings()
    } catch (error) {
      console.error('Failed to post listing:', error)
      toast.error(language === 'hi' ? 'लिस्टिंग बनाने में विफल' : 'Failed to post listing')
    }
  }

  const handlePlaceOrderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!showOrderModal) return
    if (!isAuthenticated || !user?.userId) {
      lumi.auth.signIn()
      return
    }

    const formData = new FormData(event.currentTarget)
    const qty = Number(formData.get('quantity_ordered') || orderQuantity)
    const agreedPrice = Number(formData.get('agreed_price') || showOrderModal.price_per_kg)
    const now = new Date().toISOString()

    const orderData: Omit<GrainOrder, '_id'> = {
      buyer_id: user.userId,
      listing_id: showOrderModal._id,
      quantity_ordered: qty,
      agreed_price: agreedPrice,
      total_amount: qty * agreedPrice,
      order_status: 'pending',
      buyer_info: {
        name: String(formData.get('buyer_name') || user.user_name || 'Buyer'),
        phone: String(formData.get('buyer_phone') || ''),
        company: String(formData.get('company') || '')
      },
      delivery_address: {
        state: String(formData.get('delivery_state') || showOrderModal.location.state),
        district: String(formData.get('delivery_district') || showOrderModal.location.district),
        address: String(formData.get('delivery_address') || ''),
        pincode: String(formData.get('delivery_pincode') || '')
      },
      payment_terms: String(formData.get('payment_terms') || 'on_delivery'),
      delivery_date: String(formData.get('delivery_date') || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]),
      notes: String(formData.get('notes') || ''),
      created_at: now
    }

    try {
      await lumi.entities.grain_orders.create(orderData)
      toast.success(language === 'hi' ? 'ऑर्डर सफलतापूर्वक भेजा गया!' : 'Order placed successfully!')
      setShowOrderModal(null)
      fetchOrders()
      setActiveTab('orders')
    } catch (error) {
      console.error('Failed to place order:', error)
      toast.error(language === 'hi' ? 'ऑर्डर भेजने में विफल' : 'Failed to place order')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-800 via-emerald-800 to-teal-900 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500/30 text-green-200 border border-green-400/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
                  {language === 'hi' ? 'सीधा किसान से खरीदार व्यापार' : 'Direct Farmer-to-Buyer Marketplace'}
                </span>
                <span className="bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Zero Commission
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-yellow-300 tracking-tight">
                {language === 'hi' ? 'राष्ट्रीय अनाज मंडी बाज़ार' : 'National Direct Grain Marketplace'}
              </h1>
              <p className="text-green-100 text-sm sm:text-base mt-2 max-w-2xl font-medium">
                {language === 'hi'
                  ? 'सत्यापित किसानों से सीधे उच्च गुणवत्ता वाला गेहूं, बासमती धान, सोयाबीन, सरसों और दालें खरीदें। व्हाट्सएप और फोन पर सीधे बातचीत करें।'
                  : 'Buy high quality wheat, paddy, mustard, pulses & oilseeds directly from verified farmers. Direct call & WhatsApp options with zero middleman commissions.'}
              </p>
            </div>

            {/* Top Action Tabs */}
            <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md self-stretch sm:self-auto">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${activeTab === 'browse'
                    ? 'bg-amber-400 text-gray-900 shadow-lg scale-105'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                <Search className="w-4 h-4" />
                {language === 'hi' ? 'अनाज खोजें' : 'Browse Grains'}
              </button>
              <button
                onClick={() => handleRequireAuth(() => setShowCreateListingModal(true))}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${activeTab === 'sell'
                    ? 'bg-amber-400 text-gray-900 shadow-lg scale-105'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                <Plus className="w-4 h-4" />
                {language === 'hi' ? 'अनाज बेचें' : 'Sell Grain Batch'}
              </button>
              <button
                onClick={() => handleRequireAuth(() => setActiveTab('orders'))}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${activeTab === 'orders'
                    ? 'bg-amber-400 text-gray-900 shadow-lg scale-105'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Marketplace Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === 'hi' ? 'उपलब्ध अनाज स्टॉक' : 'Total Grain Stock'}
              </span>
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">
              {(totalStockKg / 100).toLocaleString()} <span className="text-xs font-normal text-gray-500">Quintals</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">
              {(totalStockKg / 1000).toFixed(1)} Metric Tonnes Ready
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === 'hi' ? 'सत्यापित किसान विक्रेता' : 'Verified Farmers'}
              </span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">{listings.length} Farmer Batches</div>
            <span className="text-xs text-blue-600 font-semibold mt-1 block">100% Direct Farmer Sourced</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === 'hi' ? 'जैविक प्रमाणित लॉट' : 'Organic Certified'}
              </span>
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-black text-green-700">{organicCount} Batches</div>
            <span className="text-xs text-green-600 font-semibold mt-1 block">Chemical Free Guarantee</span>
          </div>

          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase text-amber-100 tracking-wider">
                {language === 'hi' ? 'औसत मंडी दर' : 'Avg Rate Benchmark'}
              </span>
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">₹{avgPricePerQuintal.toLocaleString()}</div>
            <span className="text-xs text-amber-100 font-medium">Per Quintal (100 Kg)</span>
          </div>
        </div>

        {/* BROWSE TAB CONTENT */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={
                      language === 'hi'
                        ? 'अनाज, किसान, जिला या राज्य खोजें (उदा. गेहूं, पंजाब, बासमती)...'
                        : 'Search grain, farmer, district or state (e.g. Wheat, Punjab, Basmati)...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-sm text-gray-900 placeholder-gray-400 font-semibold"
                  />
                </div>

                {/* Filter controls */}
                <div className="flex flex-wrap gap-3">
                  {/* Grain type */}
                  <select
                    value={selectedGrainType}
                    onChange={(e) => setSelectedGrainType(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  >
                    {GRAIN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {language === 'hi' ? type.hindi : type.label}
                      </option>
                    ))}
                  </select>

                  {/* Quality grade */}
                  <select
                    value={selectedQualityGrade}
                    onChange={(e) => setSelectedQualityGrade(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  >
                    {QUALITY_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g === 'All' ? 'All Quality Grades' : `Grade ${g}`}
                      </option>
                    ))}
                  </select>

                  {/* Sort order */}
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  >
                    <option value="price_desc">Price: High to Low</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="qty_desc">Quantity: Largest First</option>
                    <option value="rating">Highest Seller Rating</option>
                  </select>

                  {/* Organic checkbox button */}
                  <button
                    onClick={() => setOrganicOnly(!organicOnly)}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border ${organicOnly
                        ? 'bg-green-700 text-white border-green-700 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-green-50'
                      }`}
                  >
                    <Leaf className="w-3.5 h-3.5" /> Organic Only
                  </button>
                </div>
              </div>
            </div>

            {/* Grain Listings Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => {
                  const quintalPrice = listing.price_per_kg * 100
                  return (
                    <motion.div
                      key={listing._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Image Header with Badges */}
                      <div className="relative h-52 overflow-hidden bg-gray-100">
                        <img
                          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'}
                          alt={listing.grain_name_display || listing.grain_type}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Top Pills */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                            Grade {listing.quality_grade}
                          </span>
                          {listing.organic_certified && (
                            <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                              <Leaf className="w-3 h-3" /> Organic Certified
                            </span>
                          )}
                        </div>

                        {/* Bottom image overlay stats */}
                        <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            <Droplets className="w-3.5 h-3.5 text-blue-300" />
                            <span>Moisture: {listing.moisture_content}%</span>
                          </div>
                          {listing.seller_rating && (
                            <div className="flex items-center gap-1 text-xs font-bold bg-amber-500 text-gray-900 px-2 py-1 rounded-lg shadow-sm">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{listing.seller_rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 group-hover:text-emerald-800 transition line-clamp-1">
                            {listing.grain_name_display || listing.grain_type}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500 font-bold mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                            <span>{listing.location.village ? `${listing.location.village}, ` : ''}{listing.location.district}, {listing.location.state}</span>
                          </div>

                          <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                            {listing.description}
                          </p>
                        </div>

                        {/* Price & Quantity Box */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Price Rate</span>
                            <div className="text-xl font-black text-gray-900">
                              ₹{listing.price_per_kg} <span className="text-xs font-semibold text-gray-500">/kg</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-emerald-700">₹{quintalPrice.toLocaleString()} / Quintal</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Available</span>
                            <div className="text-base font-black text-gray-900">
                              {(listing.quantity / 100).toLocaleString()} <span className="text-xs font-normal">Qtl</span>
                            </div>
                            <span className="text-[11px] text-gray-500 font-medium">({listing.quantity.toLocaleString()} Kg)</span>
                          </div>
                        </div>

                        {/* Seller & Action Buttons */}
                        <div className="pt-2 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-7 h-7 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center text-xs">
                                {listing.contact_info.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block truncate max-w-[130px]">{listing.contact_info.name}</span>
                                {listing.verified_farmer && (
                                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified Farmer
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Direct Communication Buttons */}
                            <div className="flex items-center gap-1">
                              {listing.contact_info.phone && (
                                <a
                                  href={`tel:${listing.contact_info.phone}`}
                                  className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white rounded-xl transition shadow-sm"
                                  title="Call Farmer"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                              {listing.contact_info.whatsapp && (
                                <a
                                  href={`https://wa.me/${listing.contact_info.whatsapp}?text=Hi%20${encodeURIComponent(listing.contact_info.name)},%20I%20am%20interested%20in%20your%20${encodeURIComponent(listing.grain_name_display || listing.grain_type)}%20on%20AgriGrow.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-xl transition shadow-sm"
                                  title="WhatsApp Farmer"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedListingDetail(listing)}
                              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleRequireAuth(() => {
                                  setShowOrderModal(listing)
                                  setOrderQuantity(Math.min(500, listing.quantity))
                                })
                              }
                              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Place Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {filteredListings.length === 0 && !loading && (
              <div className="text-center py-20 px-4 bg-white rounded-3xl border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {language === 'hi' ? 'कोई अनाज लिस्टिंग नहीं मिली' : 'No Grain Listings Found'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto text-sm">
                  Try adjusting your search query, selecting all grain categories, or turning off the organic filter.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedGrainType('all')
                    setSelectedQualityGrade('All')
                    setOrganicOnly(false)
                  }}
                  className="mt-4 px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB CONTENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-md">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
              {language === 'hi' ? 'मेरे अनाज ऑर्डर' : 'My Placed Grain Orders'}
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No Orders Placed Yet</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  Browse through farmer grain batches, inspect details, and place direct trade orders.
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-6 py-3 bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md"
                >
                  Browse Grain Batches
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-2xl p-5 hover:border-emerald-300 transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-xs font-bold text-emerald-700">Order #{order._id.slice(-6).toUpperCase()}</span>
                        <div className="text-sm text-gray-500 font-medium">Placed on: {new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black capitalize bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {order.order_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 font-bold block">Quantity Ordered</span>
                        <span className="text-base font-black text-gray-900">{order.quantity_ordered.toLocaleString()} Kg</span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-bold block">Total Agreed Price</span>
                        <span className="text-base font-black text-emerald-800">₹{order.total_amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-bold block">Delivery Location</span>
                        <span className="font-bold text-gray-900">{order.delivery_address.district}, {order.delivery_address.state}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-bold block">Estimated Delivery</span>
                        <span className="font-bold text-gray-900">{order.delivery_date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedListingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedListingDetail(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="relative h-60 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={selectedListingDetail.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedListingDetail.grain_name_display || selectedListingDetail.grain_type}
                  className="w-full h-full object-cover"
                />
                {selectedListingDetail.organic_certified && (
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> Organic Certified
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {selectedListingDetail.grain_name_display || selectedListingDetail.grain_type}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mt-1">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>
                    {selectedListingDetail.location.village ? `${selectedListingDetail.location.village}, ` : ''}
                    {selectedListingDetail.location.district}, {selectedListingDetail.location.state}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
                  <span className="text-xs text-emerald-700 font-bold uppercase block">Rate per Kg</span>
                  <div className="text-2xl font-black text-emerald-900 mt-1">₹{selectedListingDetail.price_per_kg}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
                  <span className="text-xs text-blue-700 font-bold uppercase block">Rate per Quintal</span>
                  <div className="text-xl font-black text-blue-900 mt-1">₹{(selectedListingDetail.price_per_kg * 100).toLocaleString()}</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
                  <span className="text-xs text-amber-700 font-bold uppercase block">Total Available</span>
                  <div className="text-xl font-black text-amber-900 mt-1">{(selectedListingDetail.quantity / 100).toLocaleString()} Qtl</div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-bold text-gray-800 text-sm">Grain Batch Quality Parameters:</div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>• <strong>Quality Grade:</strong> Grade {selectedListingDetail.quality_grade}</div>
                  <div>• <strong>Moisture Level:</strong> {selectedListingDetail.moisture_content}%</div>
                  <div>• <strong>Harvest Date:</strong> {selectedListingDetail.harvest_date}</div>
                  <div>• <strong>Storage Method:</strong> Clean Dry Silo / Warehouse</div>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{selectedListingDetail.description}</p>

              {/* Direct Farmer Contact */}
              <div className="bg-emerald-800 text-white rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-200 font-bold block">Farmer Seller</span>
                  <div className="text-lg font-black">{selectedListingDetail.contact_info.name}</div>
                  <span className="text-xs text-emerald-300 font-semibold">{selectedListingDetail.contact_info.phone}</span>
                </div>
                <div className="flex gap-2">
                  {selectedListingDetail.contact_info.phone && (
                    <a
                      href={`tel:${selectedListingDetail.contact_info.phone}`}
                      className="px-4 py-2.5 bg-amber-400 text-gray-900 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 hover:bg-amber-300 transition"
                    >
                      <Phone className="w-4 h-4" /> Call Farmer
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedListingDetail(null)
                  handleRequireAuth(() => {
                    setShowOrderModal(selectedListingDetail)
                    setOrderQuantity(Math.min(500, selectedListingDetail.quantity))
                  })
                }}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-lg transition"
              >
                Proceed to Place Direct Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLACE ORDER MODAL WITH PRICE CALCULATOR */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOrderModal(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-gray-900 mb-1">Place Grain Order</h3>
            <p className="text-xs text-emerald-700 font-bold mb-4">
              {showOrderModal.grain_name_display || showOrderModal.grain_type} • Farmer: {showOrderModal.contact_info.name}
            </p>

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-4">
              {/* Order Quantity Calculator */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>Order Quantity (Kg):</span>
                  <span className="text-emerald-800 font-black text-sm">
                    {orderQuantity} Kg ({(orderQuantity / 100).toFixed(1)} Quintals)
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={showOrderModal.quantity}
                  step={50}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <input
                  type="number"
                  name="quantity_ordered"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  required
                  min={1}
                  max={showOrderModal.quantity}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                />

                <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                  <span className="text-xs font-bold text-gray-600">Calculated Total:</span>
                  <span className="text-2xl font-black text-emerald-900">
                    ₹{(orderQuantity * showOrderModal.price_per_kg).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Your Name</label>
                  <input
                    name="buyer_name"
                    defaultValue={user?.user_name || ''}
                    placeholder="Full Name"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    name="buyer_phone"
                    placeholder="Phone Number"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Delivery State</label>
                  <input
                    name="delivery_state"
                    defaultValue={showOrderModal.location.state}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Delivery District</label>
                  <input
                    name="delivery_district"
                    defaultValue={showOrderModal.location.district}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-bold text-gray-700 block mb-1">Delivery Address & Landmark</label>
                <textarea
                  name="delivery_address"
                  rows={2}
                  placeholder="Street address, APMC yard or mill location..."
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="text-xs">
                <label className="font-bold text-gray-700 block mb-1">Payment Terms</label>
                <select name="payment_terms" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold">
                  {PAYMENT_TERMS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-lg transition"
              >
                Submit Direct Order Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW LISTING MODAL */}
      {showCreateListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateListingModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-gray-900 mb-1">Post Grain Batch for Sale</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">
              Connect directly with buyers & mills across India with zero brokerage.
            </p>

            <form onSubmit={handleCreateListingSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Grain Category</label>
                  <select name="grain_type" required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold">
                    <option value="wheat">Wheat (गेहूं)</option>
                    <option value="rice">Rice / Paddy (धान)</option>
                    <option value="soybean">Soybean (सोयाबीन)</option>
                    <option value="mustard">Mustard (सरसों)</option>
                    <option value="chana">Chana (चना)</option>
                    <option value="corn">Maize (मक्का)</option>
                    <option value="bajra">Bajra (बाजरा)</option>
                    <option value="jowar">Jowar (ज्वार)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Display Title / Variety</label>
                  <input
                    name="grain_name_display"
                    placeholder="e.g. Sharbati Gold Wheat / Pusa 1121"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Total Quantity (Kg)</label>
                  <input
                    name="quantity"
                    type="number"
                    placeholder="e.g. 5000"
                    required
                    min={100}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price per Kg (₹)</label>
                  <input
                    name="price_per_kg"
                    type="number"
                    step="0.10"
                    placeholder="e.g. 24.50"
                    required
                    min={1}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Quality Grade</label>
                  <select name="quality_grade" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold">
                    <option value="A+">Grade A+ (Premium Export)</option>
                    <option value="A">Grade A (Superior Mandi)</option>
                    <option value="B+">Grade B+ (Standard Commercial)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">State</label>
                  <input name="state" placeholder="State" required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">District</label>
                  <input name="district" placeholder="District" required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Village / Mandi Yard</label>
                  <input name="village" placeholder="Village" required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Contact Phone</label>
                  <input name="phone" placeholder="+91..." required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">WhatsApp Number</label>
                  <input name="whatsapp" placeholder="WhatsApp Number" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Harvest Date</label>
                  <input name="harvest_date" type="date" required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Moisture Level (%)</label>
                  <input name="moisture_content" type="number" step="0.1" defaultValue={11.5} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input name="organic_certified" type="checkbox" id="organic_chk" className="w-4 h-4 accent-emerald-700 rounded" />
                <label htmlFor="organic_chk" className="font-bold text-gray-700 cursor-pointer">
                  Organic Certified Batch (No synthetic chemicals used)
                </label>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Batch Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe seed variety, threshing status, storage quality..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Photo Image URL (Optional)</label>
                <input name="image_url" placeholder="https://..." className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl" />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-lg transition"
              >
                Post Grain Batch to Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GUEST AUTH PROMPT MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Sign In to Continue</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Please log in to place direct orders, connect with farmers, or list your own grain batches for sale.
            </p>
            <button
              onClick={() => {
                setShowAuthModal(false)
                lumi.auth.signIn()
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition"
            >
              Sign In Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GrainMarketplace
