import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera, Loader, AlertTriangle, CheckCircle, Info, Cpu, Activity, RefreshCw, Sprout } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import toast from 'react-hot-toast'

interface DetectionResult {
  diseaseName: string
  crop?: string
  confidence: number
  symptoms: string[]
  treatment: string
  prevention: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metrics?: {
    greenRatio?: number
    discolorationIndex?: number
  }
}

const DiseaseDetection: React.FC = () => {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check Flask CNN Backend Health on Mount
  const checkBackendHealth = async () => {
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        setBackendOnline(true)
      } else {
        // Try direct backend port fallback
        const fallbackRes = await fetch('http://127.0.0.1:5000/api/health')
        setBackendOnline(fallbackRes.ok)
      }
    } catch {
      setBackendOnline(false)
    }
  }

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile && !selectedImage) {
      toast.error('Please upload a leaf image first')
      return
    }

    setIsAnalyzing(true)
    const formData = new FormData()

    if (selectedFile) {
      formData.append('file', selectedFile)
    } else if (selectedImage) {
      // Convert DataURL to Blob if file object is missing
      const res = await fetch(selectedImage)
      const blob = await res.blob()
      formData.append('file', blob, 'leaf_sample.jpg')
    }

    try {
      let response: Response
      try {
        response = await fetch('/api/predict', {
          method: 'POST',
          body: formData,
        })
      } catch {
        // Fallback directly to localhost 5000 if dev proxy was bypassed
        response = await fetch('http://127.0.0.1:5000/api/predict', {
          method: 'POST',
          body: formData,
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with status ${response.status}`)
      }

      const json = await response.json()
      if (json.success && json.data) {
        setResult(json.data)
        setBackendOnline(true)
        toast.success('CNN Model Analysis Completed!')
      } else {
        throw new Error(json.error || 'Failed to analyze leaf image')
      }
    } catch (err: any) {
      console.error('CNN Inference Error:', err)
      toast.error(err.message || 'Error connecting to CNN backend server')
      setBackendOnline(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-700 bg-green-100 border-green-300'
      case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-300'
      case 'high': return 'text-orange-800 bg-orange-100 border-orange-300'
      case 'critical': return 'text-red-800 bg-red-100 border-red-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle size={16} className="text-green-600" />
      case 'medium': return <Info size={16} className="text-yellow-600" />
      case 'high': 
      case 'critical': return <AlertTriangle size={16} className="text-red-600" />
      default: return <Info size={16} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header & CNN Model Connection Status */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('disease.title') || 'CNN Plant Disease Detection'}
          </h1>
          <span className="bg-green-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Cpu size={12} /> PyTorch CNN
          </span>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm">
          Upload a clear photo of a crop leaf. Our Convolutional Neural Network (CNN) analyzes leaf texture, spot geometry, and discoloration patterns to identify crop diseases instantly.
        </p>

        {/* Server Status Badge */}
        <div className="mt-4 flex items-center justify-center">
          {backendOnline === true && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              CNN Model Backend Connected (Port 5000)
            </div>
          )}
          {backendOnline === false && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
              CNN Server Disconnected. Please start Python backend (<code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">python backend/app.py</code>)
              <button 
                onClick={checkBackendHealth} 
                className="hover:underline flex items-center ml-1 text-amber-900 font-semibold"
                title="Retry connection"
              >
                <RefreshCw size={12} className="mr-0.5" /> Retry
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors bg-white shadow-sm">
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Uploaded leaf"
                  className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-md border"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-1"
                >
                  <Upload size={14} /> Change Leaf Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {t('disease.upload') || 'Upload Crop Leaf Photo'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supports JPG, PNG, WEBP (up to 10MB)
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </button>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {selectedImage && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full py-3 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-md"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Running CNN Feature Pass...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5 mr-2" />
                  Analyze with CNN Model
                </>
              )}
            </button>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isAnalyzing && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Loader className="w-6 h-6 mr-3 animate-spin text-emerald-600" />
                <div>
                  <h3 className="text-base font-semibold text-emerald-900">
                    Neural Network Processing...
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Extracting visual leaf features & running tensor classification
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-5">
              <div className="border-b pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {result.diseaseName}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${getSeverityColor(result.severity)}`}>
                    {getSeverityIcon(result.severity)}
                    <span className="capitalize">{result.severity} Severity</span>
                  </div>
                </div>
                
                {result.crop && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold px-3 py-1 rounded-lg mb-3 shadow-xs">
                    <Sprout size={15} className="text-emerald-700" />
                    <span>Crop Type / Plant: <strong className="text-emerald-950 font-bold">{result.crop}</strong></span>
                  </div>
                )}

                {/* Confidence Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium">
                    <span>CNN Confidence Score:</span>
                    <span className="text-green-700 font-bold">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, result.confidence))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Leaf Visual Analytics */}
                {result.metrics && (
                  <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded border flex items-center gap-2">
                      <Activity size={14} className="text-green-600" />
                      <div>
                        <span className="text-gray-500 block">Greenness Index</span>
                        <span className="font-semibold text-gray-800">{result.metrics.greenRatio}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border flex items-center gap-2">
                      <Activity size={14} className="text-amber-600" />
                      <div>
                        <span className="text-gray-500 block">Discoloration</span>
                        <span className="font-semibold text-gray-800">{result.metrics.discolorationIndex}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Symptoms */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1.5 flex items-center gap-1">
                    <Info size={16} className="text-blue-600" /> Key Symptoms Detected:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 pl-1">
                    {result.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>

                {/* Treatment */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1 flex items-center gap-1">
                    <AlertTriangle size={16} className="text-red-600" /> Recommended Treatment:
                  </h4>
                  <p className="text-xs text-gray-700 bg-red-50 border border-red-100 p-3 rounded-lg leading-relaxed">
                    {result.treatment}
                  </p>
                </div>

                {/* Prevention */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1 flex items-center gap-1">
                    <CheckCircle size={16} className="text-green-600" /> Long-Term Prevention:
                  </h4>
                  <p className="text-xs text-gray-700 bg-green-50 border border-green-100 p-3 rounded-lg leading-relaxed">
                    {result.prevention}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <strong>Agricultural Note:</strong> Analysis produced by PyTorch Convolutional Neural Network. For severe outbreaks, verify with your local agricultural officer.
              </div>
            </div>
          )}

          {!result && !isAnalyzing && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                No image analyzed yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Upload a crop leaf image above to view CNN disease classification output.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiseaseDetection
