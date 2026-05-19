import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../Admin/AdminApi';
import {
  Search, Star, SlidersHorizontal, ChevronDown, ChevronUp,
  RotateCcw, Grid, List, Package, ShoppingBag,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { Button, Alert, Select } from '../../components/ui';

// Premium Interactive Star Rating widget supporting user submissions and running averages
const InteractiveStars = ({ product, onRatingSaved }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Round rating to nearest integer
  const currentRatingScore = Math.round(parseFloat(product.rating || 5.0));

  const handleStarClick = async (e, starsSelected) => {
    e.stopPropagation();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Direct rating assignment for instant, responsive visual feedback!
      const newRatingScore = starsSelected;
      
      // Submit patch request to backend (AllowAny endpoint allows direct PATCH requests!)
      await adminApi.patchProduct(product.id, {
        rating: parseFloat(newRatingScore)
      });
      
      if (onRatingSaved) {
        onRatingSaved(product.id, newRatingScore);
      }
      
      // Show tooltipped success feedback
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2200);
    } catch (err) {
      console.error("Failed to submit review rating:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="customer-stars-wrapper">
      <div 
        className="customer-stars-row"
        onMouseLeave={() => setHoveredRating(0)}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const starVal = i + 1;
          const active = hoveredRating ? starVal <= hoveredRating : starVal <= currentRatingScore;
          return (
            <Star
              key={i}
              size={14}
              fill={active ? '#ff6b00' : 'none'}
              color={active ? '#ff6b00' : '#9ca3af'}
              className={`customer-star-icon ${active ? 'active' : ''}`}
              style={{ 
                transform: hoveredRating && starVal <= hoveredRating ? 'scale(1.2)' : 'scale(1)'
              }}
              onMouseEnter={() => setHoveredRating(starVal)}
              onClick={(e) => handleStarClick(e, starVal)}
            />
          );
        })}
      </div>
      
      <span className="customer-star-score">
        ({currentRatingScore})
      </span>

      {showTooltip && (
        <span className="customer-rating-tooltip">
          Rating Saved!
        </span>
      )}
    </div>
  );
};

const CustomerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Categories reference list
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Background dataset to compute live dynamic counts for Categories and Ratings
  const [allProductsForCounts, setAllProductsForCounts] = useState([]);

  // Sidebar accordions state (collapsible categories, ratings, prices)
  const [openSections, setOpenSections] = useState({
    rating: true,
    category: true,
    price: true,
    availability: true
  });

  // View state: grid or list
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Mobile Filters toggle drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Local Category search box
  const [categoryQuery, setCategoryQuery] = useState('');

  // Dynamically set page title
  useEffect(() => {
    document.title = "GearCart | Premium Equipment & Gear Store";
  }, []);

  const maxLimit = 5000;

  // 1. Sync SearchParams (URL state is single source of truth!)
  const searchVal = searchParams.get('q') || '';
  const categoryVal = searchParams.get('category') || '';
  const selectedCategories = useMemo(() => {
    return categoryVal ? categoryVal.split(',').filter(Boolean) : [];
  }, [categoryVal]);
  const minPriceVal = searchParams.get('min_price') || '';
  const maxPriceVal = searchParams.get('max_price') || '';
  const minRatingVal = searchParams.get('min_rating') || '';
  const isAvailableVal = searchParams.get('is_available') || 'true'; // default In Stock only
  const sortByVal = searchParams.get('sort_by') || 'newest';
  const pageVal = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 6; // balance view

  // Local state for Price input fields (don't update query string on every keystroke)
  const [minPriceInput, setMinPriceInput] = useState(minPriceVal);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceVal);

  // Range Slider States
  const [sliderMin, setSliderMin] = useState(minPriceVal ? parseInt(minPriceVal, 10) : 0);
  const [sliderMax, setSliderMax] = useState(maxPriceVal ? parseInt(maxPriceVal, 10) : maxLimit);

  // Sync inputs if search params are cleared or loaded from outside
  useEffect(() => {
    setMinPriceInput(minPriceVal);
    setSliderMin(minPriceVal ? parseInt(minPriceVal, 10) : 0);
  }, [minPriceVal]);

  useEffect(() => {
    setMaxPriceInput(maxPriceVal);
    setSliderMax(maxPriceVal ? parseInt(maxPriceVal, 10) : maxLimit);
  }, [maxPriceVal]);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategoriesData = async () => {
      setCategoriesLoading(true);
      try {
        const list = await adminApi.getCategories();
        setCategories(list || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategoriesData();
  }, []);

  // Fetch complete product counts on catalog changes (runs in background)
  const fetchAllCounts = async () => {
    try {
      // Get all active available items (unpaginated) to compute counts
      const data = await adminApi.getProducts({ page_size: 1000, is_available: 'true' });
      setAllProductsForCounts(data.results || []);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchAllCounts();
  }, []); // Only fetch counts once on mount to avoid duplicate API calls during navigation/filtering

  // 2. Fetch Paginated and Filtered Products on URL search params change
  useEffect(() => {
    const fetchFilteredCatalog = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const params = {
          page: pageVal,
          page_size: pageSize,
          sort_by: sortByVal,
        };

        if (searchVal.trim()) params.q = searchVal.trim();
        if (categoryVal) params.category = categoryVal;
        if (minPriceVal) params.min_price = minPriceVal;
        if (maxPriceVal) params.max_price = maxPriceVal;
        if (minRatingVal) params.min_rating = minRatingVal;
        if (isAvailableVal === 'true') {
          params.is_available = 'true';
        }

        const data = await adminApi.getProducts(params);
        setProducts(data.results || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load products. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredCatalog();
  }, [searchVal, categoryVal, minPriceVal, maxPriceVal, minRatingVal, isAvailableVal, sortByVal, pageVal]);

  // Helper: push new URL search params safely
  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);

    // Reset page to 1 unless page is explicitly supplied
    if (!('page' in newParams)) {
      nextParams.set('page', '1');
    }

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val.toString());
      }
    });

    setSearchParams(nextParams);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams({ page: '1', is_available: 'true' }));
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  // Toggle sections
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), sliderMax - 50);
    setSliderMin(value);
    setMinPriceInput(value.toString());
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), sliderMin + 50);
    setSliderMax(value);
    setMaxPriceInput(value.toString());
  };

  const handleMinInput = (e) => {
    const valStr = e.target.value;
    setMinPriceInput(valStr);
    const val = Number(valStr);
    if (!isNaN(val) && val >= 0 && val <= sliderMax) {
      setSliderMin(val);
    }
  };

  const handleMaxInput = (e) => {
    const valStr = e.target.value;
    setMaxPriceInput(valStr);
    const val = Number(valStr);
    if (!isNaN(val) && val >= sliderMin && val <= maxLimit) {
      setSliderMax(val);
    }
  };

  // Compute live category and rating counts dynamically in the frontend!
  const categoryCounts = useMemo(() => {
    const counts = {};
    allProductsForCounts.forEach(p => {
      const cid = p.category;
      if (cid) {
        counts[cid] = (counts[cid] || 0) + 1;
      }
    });
    return counts;
  }, [allProductsForCounts]);

  const ratingCounts = useMemo(() => {
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    allProductsForCounts.forEach(p => {
      const rating = parseFloat(p.rating || 0);
      if (rating >= 4) counts[4]++;
      if (rating >= 3) counts[3]++;
      if (rating >= 2) counts[2]++;
      if (rating >= 1) counts[1]++;
    });
    return counts;
  }, [allProductsForCounts]);

  // Filter categories list inside the Sidebar local search box
  const filteredCategoriesList = useMemo(() => {
    return categories.filter(c => c.name.toLowerCase().includes(categoryQuery.toLowerCase()));
  }, [categories, categoryQuery]);

  // Handle mock purchase
  const handleBuyProduct = (productName) => {
    setSuccessMsg(`Congratulations! Your purchase of "${productName}" was placed successfully.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRatingSaved = (productId, newRating) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, rating: newRating } : p));
    setAllProductsForCounts(prev => prev.map(p => p.id === productId ? { ...p, rating: newRating } : p));
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Render Gold/Amber Stars based on rating
  const renderStars = (rating) => {
    const score = Math.round(parseFloat(rating || 5));
    return (
      <div style={{ display: 'flex', gap: '2px', color: '#ff6b00' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < score ? '#ff6b00' : 'none'}
            style={{ opacity: i < score ? 1 : 0.2 }}
          />
        ))}
      </div>
    );
  };

  // Render high-fidelity stock status badges based on urgency
  const renderStockBadge = (stock) => {
    if (stock >= 50) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.725rem',
          fontWeight: 600,
          backgroundColor: '#dcfce7',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          width: 'fit-content'
        }}>
          <span style={{ fontSize: '0.8rem' }}>✓</span> In Stock ({stock} units available)
        </span>
      );
    } else if (stock >= 10) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.725rem',
          fontWeight: 600,
          backgroundColor: '#ccfbf1',
          color: '#0f766e',
          border: '1px solid #99f6e4',
          width: 'fit-content'
        }}>
          <span style={{ fontSize: '0.8rem' }}>✓</span> In Stock ({stock} left)
        </span>
      );
    } else if (stock > 0) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.725rem',
          fontWeight: 600,
          backgroundColor: '#fef3c7',
          color: '#b45309',
          border: '1px solid #fde68a',
          width: 'fit-content',
          animation: 'pulse 2s infinite'
        }}>
          <span style={{ fontSize: '0.8rem' }}>⚠️</span> Hurry! Only {stock} left in stock - Order Soon!
        </span>
      );
    } else {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.725rem',
          fontWeight: 600,
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          width: 'fit-content'
        }}>
          <span style={{ fontSize: '0.8rem' }}>✖</span> Temporarily Out of Stock
        </span>
      );
    }
  };

  // Render Dynamic Product Image or sleek package gradient placeholder
  const renderProductImage = (product) => {
    if (product.image) {
      return (
        <img
          src={product.image}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-normal)' }}
          className="product-card-img"
        />
      );
    }
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        color: '#9ca3af',
        gap: '8px',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <Package size={40} strokeWidth={1.5} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>No Image Available</span>
      </div>
    );
  };

  return (
    <div className="customer-dashboard-wrapper">
      
      {/* Alert Notices */}
      {successMsg && (
        <Alert
          message={successMsg}
          type="success"
          onClose={() => setSuccessMsg('')}
        />
      )}

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          onClose={() => setErrorMsg('')}
        />
      )}

      {/* Dynamic E-Commerce Landing Banner */}
      <div className="customer-banner">
        <div>
          <h1 className="customer-banner-title">
            Everything You Need, All in One Place
          </h1>
          <p className="customer-banner-subtitle">
            Explore trending collections, exclusive deals, and fast delivery right at your fingertips.          </p>
        </div>
        <ShoppingBag size={32} className="customer-banner-icon" style={{ opacity: 0.25, transform: 'rotate(-10deg)' }} />
      </div>

      {/* Mobile Filter Toggle Button */}
      <button 
        className="mobile-filter-btn" 
        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      >
        <SlidersHorizontal size={16} />
        <span>{mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
      </button>

      {/* Main Core Layout Grid (25% Sidebar Filter Panel & 75% Catalog Grid) */}
      <div className="customer-core-grid">

        {/* ================= LEFT SIDEBAR (25% WIDTH FILTERS) ================= */}
        <aside className={`customer-sidebar ${mobileFiltersOpen ? 'open' : ''}`}>
          {/* Filters Header */}
          <div className="customer-sidebar-header">
            <span className="customer-sidebar-title">
              <SlidersHorizontal size={16} /> Filters
            </span>
            <button
              onClick={handleClearAll}
              className="customer-sidebar-clear-btn"
            >
              <RotateCcw size={12} /> Clear All
            </button>
          </div>

          {/* SECTION 1: SEARCH BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="customer-filter-label">
              Search Products
            </span>
            <div className="customer-filter-search-wrapper">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => updateFilters({ q: e.target.value })}
                placeholder="Search for items..."
                className="customer-filter-search-input"
              />
              <Search size={14} className="customer-filter-search-icon" />
            </div>
          </div>

          {/* SECTION 2: RATING FILTER ACCORDION */}
          <div className="customer-filter-section">
            <div
              onClick={() => toggleSection('rating')}
              className="customer-filter-header"
            >
              <span className="customer-filter-title">
                Customer Ratings
              </span>
              {openSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {openSections.rating && (
              <div className="customer-filter-content">
                {[4, 3, 2, 1].map(stars => (
                  <label
                    key={stars}
                    className="customer-filter-checkbox-label"
                    style={{
                      color: minRatingVal === stars.toString() ? 'var(--primary-color)' : 'var(--text-primary)',
                      fontWeight: minRatingVal === stars.toString() ? 600 : 400
                    }}
                  >
                    <div className="customer-filter-checkbox-row">
                      <input
                        type="radio"
                        name="rating_min"
                        checked={minRatingVal === stars.toString()}
                        onChange={() => updateFilters({ min_rating: stars })}
                        className="customer-filter-checkbox"
                      />
                      {renderStars(stars)}
                      <span>& up</span>
                    </div>
                    <span className="customer-filter-count">
                      ({ratingCounts[stars] || 0})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: CATEGORY FILTER ACCORDION */}
          <div className="customer-filter-section">
            <div
              onClick={() => toggleSection('category')}
              className="customer-filter-header"
            >
              <span className="customer-filter-title">
                Category
              </span>
              {openSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {openSections.category && (
              <div className="customer-filter-content">
                {/* Category Search Input */}
                <div className="customer-filter-search-wrapper" style={{ marginBottom: '4px' }}>
                  <input
                    type="text"
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    placeholder="Search category..."
                    className="customer-category-search-input"
                  />
                  <Search size={10} className="customer-category-search-icon" />
                </div>

                <div className="customer-filter-scroll-list">
                  {categoriesLoading ? (
                    <span className="customer-filter-count" style={{ textAlign: 'center' }}>Loading...</span>
                  ) : filteredCategoriesList.length === 0 ? (
                    <span className="customer-filter-count" style={{ textAlign: 'center' }}>No categories found</span>
                  ) : (
                    <>
                      {/* All Categories Option */}
                      <label className="customer-filter-checkbox-label">
                        <div className="customer-filter-checkbox-row">
                          <input
                            type="checkbox"
                            checked={selectedCategories.length === 0}
                            onChange={() => updateFilters({ category: '' })}
                            className="customer-filter-checkbox"
                          />
                          <span style={{ fontWeight: selectedCategories.length === 0 ? 600 : 400, color: selectedCategories.length === 0 ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                            All Categories
                          </span>
                        </div>
                      </label>

                      {filteredCategoriesList.map(cat => {
                        const isChecked = selectedCategories.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className="customer-filter-checkbox-label"
                            style={{
                              fontWeight: isChecked ? 600 : 400,
                              color: isChecked ? 'var(--primary-color)' : 'var(--text-primary)'
                            }}
                          >
                            <div className="customer-filter-checkbox-row">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  let nextCategories;
                                  if (isChecked) {
                                    nextCategories = selectedCategories.filter(id => id !== cat.id);
                                  } else {
                                    nextCategories = [...selectedCategories, cat.id];
                                  }
                                  updateFilters({ category: nextCategories.join(',') });
                                }}
                                className="customer-filter-checkbox"
                              />
                              <span>{cat.name}</span>
                            </div>
                            <span className="customer-filter-count">
                              ({categoryCounts[cat.id] || 0})
                            </span>
                          </label>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: PRICE RANGE ACCORDION */}
          <div className="customer-filter-section">
            <div
              onClick={() => toggleSection('price')}
              className="customer-filter-header"
            >
              <span className="customer-filter-title">
                Price Range ($)
              </span>
              {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {openSections.price && (
              <div className="customer-filter-content">
                
                {/* Live Range display */}
                <div className="customer-price-text-row">
                  <span>Min: <strong>${sliderMin}</strong></span>
                  <span>Max: <strong>${sliderMax === maxLimit ? `$${maxLimit}+` : `$${sliderMax}`}</strong></span>
                </div>

                {/* Double range slider widget */}
                <div className="price-slider-container">
                  <div className="price-slider-track-bg" />
                  <div 
                    className="price-slider-track-active" 
                    style={{
                      left: `${(sliderMin / maxLimit) * 100}%`,
                      width: `${((sliderMax - sliderMin) / maxLimit) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxLimit}
                    value={sliderMin}
                    onChange={handleMinChange}
                    className="price-slider-input"
                    style={{ zIndex: sliderMin > maxLimit - 100 ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxLimit}
                    value={sliderMax}
                    onChange={handleMaxChange}
                    className="price-slider-input"
                    style={{ zIndex: sliderMin > maxLimit - 100 ? 3 : 4 }}
                  />
                </div>

                {/* Custom Keyboard Input row */}
                <div className="customer-price-input-row">
                  <input
                    type="number"
                    value={minPriceInput}
                    onChange={handleMinInput}
                    placeholder="Min"
                    className="customer-price-input"
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>-</span>
                  <input
                    type="number"
                    value={maxPriceInput}
                    onChange={handleMaxInput}
                    placeholder="Max"
                    className="customer-price-input"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => updateFilters({ min_price: minPriceInput, max_price: maxPriceInput })}
                  style={{ width: '100%', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', height: '30px' }}
                >
                  Apply Price
                </Button>
              </div>
            )}
          </div>

          {/* SECTION 5: AVAILABILITY ACCORDION */}
          <div className="customer-filter-section">
            <div
              onClick={() => toggleSection('availability')}
              className="customer-filter-header"
            >
              <span className="customer-filter-title">
                Availability
              </span>
              {openSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {openSections.availability && (
              <div className="customer-filter-content">
                <label className="customer-filter-checkbox-label" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isAvailableVal === 'true'}
                    onChange={(e) => updateFilters({ is_available: e.target.checked ? 'true' : 'all' })}
                    className="customer-filter-checkbox"
                  />
                  <span style={{ fontWeight: isAvailableVal === 'true' ? 600 : 400, color: isAvailableVal === 'true' ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                    In Stock Only
                  </span>
                </label>

                <label className="customer-filter-checkbox-label" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isAvailableVal === 'all'}
                    onChange={(e) => updateFilters({ is_available: e.target.checked ? 'all' : 'true' })}
                    className="customer-filter-checkbox"
                  />
                  <span style={{ fontWeight: isAvailableVal === 'all' ? 600 : 400, color: isAvailableVal === 'all' ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                    Show All (Include Sold Out)
                  </span>
                </label>
              </div>
            )}
          </div>

        </aside>

        {/* ================= RIGHT MAIN CATALOG (75% WIDTH) ================= */}
        <section className="customer-catalog-section">

          {/* Sort bar, count state, and layout toggle */}
          <div className="sort-bar-container">
            <span className="pagination-info">
              We found <strong>{totalCount}</strong> item{totalCount === 1 ? '' : 's'} for you
            </span>

            <div className="sort-bar-right">

              {/* Sort selector dropdown */}
              <div className="sort-bar-select-row">
                <span className="customer-filter-label">
                  Sort By:
                </span>
                <Select
                  value={sortByVal}
                  onChange={(val) => updateFilters({ sort_by: val })}
                  options={[
                    { value: 'newest', label: 'Newest Arrivals' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' }
                  ]}
                  style={{ minWidth: '170px' }}
                />
              </div>

              <div className="sort-bar-divider" />

              {/* Grid / List toggle switches */}
              <div className="viewmode-buttons-group">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`viewmode-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`viewmode-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <List size={14} />
                </button>
              </div>

            </div>
          </div>

          {/* Dynamic state loaders */}
          {isLoading ? (
            <div className="customer-loading-wrapper">
              <div className="customer-loading-spinner" />
            </div>
          ) : products.length === 0 ? (
            // E-Commerce Empty State
            <div className="customer-empty-state">
              <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>
                No Products Found
              </h3>
              <p>
                We couldn't find any products matching your active filters. Try adjusting your search term or filters to discover other great options!
              </p>
              <Button
                variant="primary"
                onClick={handleClearAll}
                style={{ marginTop: '20px', padding: '10px 20px' }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Product Catalog Deck Grid/List Layouts */}
              {viewMode === 'grid' ? (
                /* 1. GRID CATALOG VIEW */
                <div className="customer-grid-deck">
                  {products.map(product => (
                    <div key={product.id} className="product-card grid">
                      {/* Rating Badge */}
                      <span className="product-card-rating-badge">
                        ★ {Math.round(parseFloat(product.rating || 5.0))}
                      </span>

                      {/* Cover Photo */}
                      <div className="product-card-img-wrapper">
                        {renderProductImage(product)}
                      </div>

                      {/* Details Box */}
                      <div className="product-card-details">
                        <div className="product-card-details-header">
                          <span className="product-card-category-badge">
                            {product.category_name || 'Gear'}
                          </span>
                          <span 
                            className={`product-card-stock-status ${product.stock > 0 ? (product.stock <= 5 ? 'urgency-stock' : 'in-stock') : 'out-of-stock'}`}
                            title={product.stock > 0 ? `${product.stock} items available` : 'Out of Stock'}
                          >
                            {product.stock > 0 ? `✓ ${product.stock}` : '✖ 0'}
                          </span>
                        </div>

                        <h3 className="product-card-title">
                          {product.name}
                        </h3>

                        {/* Interactive Review Star System */}
                        <InteractiveStars product={product} onRatingSaved={handleRatingSaved} />

                        <p className="product-card-desc">
                          {product.description || 'No description available.'}
                        </p>

                        {/* Price & Cart CTA */}
                        <div className="product-card-footer">
                          <span className="product-card-price">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>

                          <Button
                            variant="primary"
                            onClick={() => handleBuyProduct(product.name)}
                            disabled={product.stock <= 0}
                            style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                          >
                            <ShoppingBag size={12} />
                            <span>Buy Now</span>
                          </Button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                /* 2. LIST CATALOG VIEW */
                <div className="customer-list-deck">
                  {products.map(product => (
                    <div key={product.id} className="product-card list">
                      {/* Visual cover list style */}
                      <div className="product-card-img-wrapper">
                        {renderProductImage(product)}
                      </div>

                      {/* Specification layout details */}
                      <div className="product-card-details">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span className="product-card-category-badge">
                                {product.category_name || 'Gear'}
                              </span>
                              <span 
                                className={`product-card-stock-status ${product.stock > 0 ? (product.stock <= 5 ? 'urgency-stock' : 'in-stock') : 'out-of-stock'}`}
                                title={product.stock > 0 ? `${product.stock} items available` : 'Out of Stock'}
                              >
                                {product.stock > 0 ? `✓ ${product.stock}` : '✖ 0'}
                              </span>
                            </div>
                            <span className="product-card-rating-badge" style={{ position: 'static' }}>
                              ★ {Math.round(parseFloat(product.rating || 5.0))}
                            </span>
                          </div>

                          <h3 className="product-card-title">
                            {product.name}
                          </h3>

                          {/* Interactive Review Star System */}
                          <div style={{ marginTop: '4px' }}>
                            <InteractiveStars product={product} onRatingSaved={handleRatingSaved} />
                          </div>

                          <p className="product-card-desc">
                            {product.description || 'No description available.'}
                          </p>
                        </div>

                        {/* Footer details row */}
                        <div className="product-card-footer">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span className="product-card-price">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                          </div>

                          <Button
                            variant="primary"
                            onClick={() => handleBuyProduct(product.name)}
                            disabled={product.stock <= 0}
                            style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <ShoppingBag size={12} />
                            <span>Buy Now</span>
                          </Button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic responsive Pagination */}
              {totalPages > 1 && (
                <div className="pagination-deck">
                  <span className="pagination-info">
                    Showing <strong>{(pageVal - 1) * pageSize + 1}</strong> to <strong>{Math.min(pageVal * pageSize, totalCount)}</strong> of <strong>{totalCount}</strong> products
                  </span>

                  <div className="pagination-buttons">
                    <button
                      onClick={() => updateFilters({ page: Math.max(1, pageVal - 1) })}
                      disabled={pageVal === 1}
                      className="pagination-nav-btn"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNo => (
                      <button
                        key={pageNo}
                        onClick={() => updateFilters({ page: pageNo })}
                        className={`pagination-page-btn ${pageVal === pageNo ? 'active' : ''}`}
                      >
                        {pageNo}
                      </button>
                    ))}

                    <button
                      onClick={() => updateFilters({ page: Math.min(totalPages, pageVal + 1) })}
                      disabled={pageVal === totalPages}
                      className="pagination-nav-btn"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </section>

      </div>
    </div>
  );
};

export default CustomerDashboard;
export { CustomerDashboard };
