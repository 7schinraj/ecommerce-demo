import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from './AdminApi';
import { Input, Button, Alert } from '../../components/ui';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

const AddProductForm = ({ productToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    is_available: true,
    category: ''
  });
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Category state variables
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Close category dropdown on clicking outside and reset search text to selected category name
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setIsCategoryDropdownOpen(false);
        // Reset query text to active selected category name (or empty if none)
        if (formData.category) {
          const match = categories.find(c => c.id === formData.category);
          if (match) {
            setCategorySearchQuery(match.name);
          }
        } else {
          setCategorySearchQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [formData.category, categories]);

  // Fetch all categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const list = await adminApi.getCategories();
      setCategories(list || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Smart Drag & Drop file state variables
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Load product details if editing
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        sku: productToEdit.sku || '',
        price: productToEdit.price || '',
        stock: productToEdit.stock || '',
        description: productToEdit.description || '',
        image: productToEdit.image || '',
        is_available: productToEdit.is_available ?? true,
        category: productToEdit.category || ''
      });
      setPreviewUrl(productToEdit.image || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        sku: '',
        price: '',
        stock: '',
        description: '',
        image: '',
        is_available: true,
        category: ''
      });
      setPreviewUrl('');
      setImageFile(null);
    }
    setErrors({});
    setServerError('');
  }, [productToEdit]);

  // Sync category input value with selected category
  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const match = categories.find(c => c.id === formData.category);
      if (match) {
        setCategorySearchQuery(match.name);
      }
    } else if (!formData.category) {
      setCategorySearchQuery('');
    }
  }, [formData.category, categories]);

  // Filtered categories based on input text
  const filteredCategories = categories.filter(c => {
    // If the input matches the selected category name exactly, show all categories (so they see other options on focus)
    const selectedCategoryName = categories.find(cat => cat.id === formData.category)?.name || '';
    if (categorySearchQuery === selectedCategoryName) return true;
    return c.name.toLowerCase().includes(categorySearchQuery.toLowerCase());
  });

  const handleCategoryInputChange = (e) => {
    const val = e.target.value;
    setCategorySearchQuery(val);
    setIsCategoryDropdownOpen(true);
    
    // If they typed something, check if it matches an existing category exactly
    const exactMatch = categories.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
    if (exactMatch) {
      setFormData(prev => ({ ...prev, category: exactMatch.id }));
    } else {
      // If it doesn't match exactly, clear the active category UUID so it doesn't submit a mismatch
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: '' }));
        }
      } else {
        setErrors((prev) => ({ ...prev, image: 'Please drop a valid image file (JPEG, PNG, WEBP)' }));
      }
    }
  };

  // File browser handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: '' }));
        }
      } else {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }));
      }
    }
  };

  // Clear image handler
  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const formErrors = {};
    if (!formData.name.trim()) formErrors.name = 'Product name is required';
    if (!formData.sku.trim()) formErrors.sku = 'SKU code is required';
    
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      formErrors.price = 'Price must be a valid positive number';
    }
    
    const stockNum = parseInt(formData.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      formErrors.stock = 'Stock count must be zero or a positive integer';
    }
    
    if (!formData.description.trim()) {
      formErrors.description = 'Product description is required';
    }

    if (!formData.category) {
      formErrors.category = 'Product category is required';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Build standard FormData object to stream file uploads!
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('sku', formData.sku.trim().toUpperCase());
      formDataToSend.append('price', parseFloat(formData.price).toFixed(2));
      formDataToSend.append('stock', parseInt(formData.stock));
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('is_available', parseInt(formData.stock) > 0);
      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }

      // Support our HybridImageField behavior:
      if (imageFile) {
        formDataToSend.append('image', imageFile); // raw File object -> Cloudinary uploads
      } else if (formData.image) {
        formDataToSend.append('image', formData.image); // Retains existing URL string
      }

      let result;
      if (productToEdit) {
        result = await adminApi.updateProduct(productToEdit.id, formDataToSend);
      } else {
        result = await adminApi.createProduct(formDataToSend);
      }

      onSave(result, productToEdit ? 'edit' : 'create');
    } catch (err) {
      let msg = 'Failed to save product.';
      if (err.response?.data?.errors) {
        const errorData = err.response.data.errors;
        if (typeof errorData === 'object') {
          const errorList = Object.entries(errorData).map(([key, val]) => {
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
            return `${fieldName}: ${Array.isArray(val) ? val[0] : val}`;
          });
          msg = errorList.join(' | ');
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {serverError && (
        <Alert
          message={serverError}
          type="error"
          onClose={() => setServerError('')}
          style={{ marginBottom: 'var(--spacing-lg)' }}
        />
      )}

      {/* Form Input Deck */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Product Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. Premium Gaming Keyboard"
          error={errors.name}
          disabled={isLoading}
          required={true}
          style={{ marginBottom: '0' }}
        />

        <Input
          label="SKU Code"
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleInputChange}
          placeholder="e.g. KB-PRM-RGB-01"
          error={errors.sku}
          disabled={isLoading}
          required={true}
          style={{ marginBottom: '0' }}
        />

        {/* Searchable Category Selector Dropdown */}
        <div ref={categoryDropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Category <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text"
              value={categorySearchQuery}
              onChange={handleCategoryInputChange}
              onFocus={() => !isLoading && setIsCategoryDropdownOpen(true)}
              placeholder="Search or type to create category..."
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#fff',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: isLoading ? 'not-allowed' : 'text',
                transition: 'all var(--transition-fast)',
                outline: 'none',
                borderColor: isCategoryDropdownOpen ? 'var(--primary-color)' : 'var(--border-color)',
                boxShadow: isCategoryDropdownOpen ? '0 0 0 4px var(--primary-glow)' : 'none'
              }}
            />
            {/* Toggle arrow right inside the input box */}
            <span 
              onClick={() => !isLoading && setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              style={{
                position: 'absolute',
                right: '16px',
                cursor: 'pointer',
                border: 'solid var(--text-secondary)',
                borderWidth: '0 2px 2px 0',
                display: 'inline-block',
                padding: '3px',
                transform: isCategoryDropdownOpen ? 'rotate(-135deg)' : 'rotate(45deg)',
                transition: 'transform var(--transition-fast)',
                marginTop: isCategoryDropdownOpen ? '4px' : '-2px',
                userSelect: 'none'
              }}
            />
          </div>

          {errors.category && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '2px' }}>
              {errors.category}
            </span>
          )}

          {isCategoryDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 999,
                marginTop: '6px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {/* Categories List Options */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {categoriesLoading ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px', textAlign: 'center' }}>
                    Loading categories...
                  </span>
                ) : (
                  <>
                    {filteredCategories.map(category => (
                      <div 
                        key={category.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: category.id }));
                          setCategorySearchQuery(category.name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '0.85rem',
                          color: formData.category === category.id ? '#fff' : 'var(--text-primary)',
                          backgroundColor: formData.category === category.id ? 'var(--primary-color)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (formData.category !== category.id) {
                            e.target.style.backgroundColor = 'var(--primary-light)';
                            e.target.style.color = 'var(--primary-color)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (formData.category !== category.id) {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = 'var(--text-primary)';
                          }
                        }}
                      >
                        {category.name}
                      </div>
                    ))}

                    {filteredCategories.length === 0 && !categorySearchQuery.trim() && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px', textAlign: 'center' }}>
                        No categories found.
                      </span>
                    )}

                    {/* Quick Create Button if Search String Not Found */}
                    {categorySearchQuery.trim() && !categories.some(c => c.name.toLowerCase() === categorySearchQuery.trim().toLowerCase()) && (
                      <div
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (isCreatingCategory) return;
                          setIsCreatingCategory(true);
                          try {
                            const newCategoryName = categorySearchQuery.trim();
                            const newCategory = await adminApi.createCategory({ name: newCategoryName });
                            setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
                            setFormData(prev => ({ ...prev, category: newCategory.id }));
                            setCategorySearchQuery(newCategory.name);
                            setIsCategoryDropdownOpen(false);
                          } catch (err) {
                            alert(err.response?.data?.errors?.name?.[0] || err.message || "Failed to create category");
                          } finally {
                            setIsCreatingCategory(false);
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--primary-color)',
                          backgroundColor: 'var(--primary-light)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all var(--transition-fast)',
                          marginTop: '4px',
                          border: '1px dashed var(--primary-color)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                          e.currentTarget.style.color = 'var(--primary-color)';
                        }}
                      >
                        <span>Create "{categorySearchQuery.trim()}"</span>
                        {isCreatingCategory ? (
                          <span style={{ fontSize: '0.75rem' }}>Creating...</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem' }}>+ Quick Add</span>
                        )}
                      </div>
                    )}

                    {/* Empty State */}
                    {!categorySearchQuery.trim() && categories.length === 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px', textAlign: 'center' }}>
                        No categories found. Type to create one!
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Price ($)"
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="e.g. 129.99"
            error={errors.price}
            disabled={isLoading}
            style={{ marginBottom: '0' }}
            required={true}
          />

          <Input
            label="Stock Quantity"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            placeholder="e.g. 50"
            error={errors.stock}
            disabled={isLoading}
            style={{ marginBottom: '0' }}
            required={true}
          />
        </div>

        {/* Smart, Premium Drag and Drop File Upload UI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Product Image
          </span>
          {previewUrl ? (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px 16px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius-lg)', 
                backgroundColor: 'var(--primary-light)',
                position: 'relative',
                animation: 'fadeIn var(--transition-fast) forwards'
              }}
            >
              <div 
                style={{ 
                  width: '72px', 
                  height: '54px', 
                  borderRadius: 'var(--border-radius)', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: '#fff',
                  flexShrink: 0
                }}
              >
                <img src={previewUrl} alt="Machine preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: '1 1 auto', overflow: 'hidden' }}>
                <p 
                  style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    marginBottom: '2px'
                  }}
                >
                  {imageFile ? imageFile.name : 'Cloudinary Image Asset'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Currently active on product'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  backgroundColor: '#FFEBEA',
                  color: 'var(--error-color)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  flexShrink: 0
                }}
                title="Remove product image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className={`upload-container ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="upload-icon-wrapper">
                <UploadCloud size={22} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Drag & drop product image here
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports PNG, JPEG, WEBP or SVG (or click to browse local files)
                </p>
              </div>
            </div>
          )}
          {errors.image && (
            <span className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', color: 'var(--error-color)', fontWeight: 500, marginTop: '2px' }}>
              ❌ {errors.image}
            </span>
          )}
        </div>

        {/* Technical Specs Textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label 
            className="input-label" 
            style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            Product Description <span style={{ color: 'var(--error-color)', fontWeight: 'bold', marginLeft: '4px' }}>*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Specify product features, specifications, and layout details..."
            rows="5"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius)',
              border: errors.description ? '1px solid var(--error-border)' : '1px solid var(--border-color)',
              backgroundColor: errors.description ? 'var(--error-light)' : 'var(--surface-color)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'all var(--transition-fast)'
            }}
          />
          {errors.description && (
            <span className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', color: 'var(--error-color)', fontWeight: 500, marginTop: '2px' }}>
              ❌ {errors.description}
            </span>
          )}
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div 
        style={{
          position: 'sticky',
          bottom: '-32px',
          left: '-32px',
          right: '-32px',
          margin: '32px -32px -32px -32px',
          padding: '16px 32px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#F9FAFB',
          zIndex: 10
        }}
      >
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {productToEdit ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default AddProductForm;
export { AddProductForm };
