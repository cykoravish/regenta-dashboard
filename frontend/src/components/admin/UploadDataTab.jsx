"use client"

import { useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import axios from "axios"

function UploadDataTab() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
        setUploadStatus(null)
      } else {
        setUploadStatus({
          type: "error",
          message: "Please upload a CSV file only",
        })
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
        setUploadStatus(null)
      } else {
        setUploadStatus({
          type: "error",
          message: "Please upload a CSV file only",
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({
        type: "error",
        message: "Please select a file first",
      })
      return
    }

    setUploading(true)
    setUploadStatus(null)

    const formData = new FormData()
    formData.append("csvFile", file)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload-csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUploadStatus({
        type: "success",
        message: response.data.message,
      })
      setUploadedCount(response.data.count)
      setFile(null)
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error.response?.data?.error || "Failed to upload CSV file",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadStatus(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Upload User Data
        </h1>
        <p className="text-gray-600">Upload a CSV file containing user data for payment processing</p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">CSV Format Instructions</h3>
        <p className="text-blue-800 mb-3">Your CSV (Comma delimited) file should contain the following columns:</p>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>
            <strong>amount</strong> - Payment amount (number)
          </li>
          <li>
            <strong>fullName</strong> - Full name of the user
          </li>
          <li>
            <strong>email</strong> - Email address
          </li>
          <li>
            <strong>phone</strong> - Phone number
          </li>
        </ul>
        <p className="text-blue-800 mt-3 text-sm">Example: amount,fullName,email,phone</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Drop your CSV file here</h3>
              <p className="text-gray-500 mb-6">or click to browse</p>
              <label className="inline-block">
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium cursor-pointer hover:shadow-lg transition-all duration-200 inline-block">
                  Select CSV File
                </span>
              </label>
            </>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <FileText className="w-12 h-12 text-blue-600" />
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button onClick={removeFile} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {file && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload CSV
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
              uploadStatus.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${uploadStatus.type === "success" ? "text-green-900" : "text-red-900"}`}>
                {uploadStatus.type === "success" ? "Success!" : "Error"}
              </p>
              <p className={`text-sm ${uploadStatus.type === "success" ? "text-green-800" : "text-red-800"}`}>
                {uploadStatus.message}
              </p>
              {uploadStatus.type === "success" && uploadedCount > 0 && (
                <p className="text-sm text-green-800 mt-1">{uploadedCount} records uploaded successfully</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadDataTab
