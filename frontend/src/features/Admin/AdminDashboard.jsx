import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from './AdminApi';
import AddProductForm from './AddProductForm';
import {
  Plus, Search, Filter, Edit, Trash, Package, Star,
  Grid, List, ChevronLeft, ChevronRight, Laptop,
  ShieldAlert, X, Sparkles
} from 'lucide-react';
import { Button, Alert, Select } from '../../components/ui';

// Safe Image component that handles broken image URLs dynamically
const SafeAdminImage = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    const isThumbnail = className && className.includes('admin-td-img');
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF5EE 0%, #FFE4E1 100%)',
          color: '#FF6B00',
          gap: isThumbnail ? '0' : '4px',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <Sparkles size={isThumbnail ? 14 : 24} strokeWidth={1.5} style={{ opacity: 0.8 }} />
        {!isThumbnail && (
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No Image</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

const AdminDashboard = () => {
  // Inventory Lists & Counts
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  // Filtering & Pagination Parameters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [availability, setAvailability] = useState('all'); // all, available, out
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoriesList, setCategoriesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch categories on dashboard mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const list = await adminApi.getCategories();
        setCategoriesList(list || []);
      } catch (err) {
        console.error('Failed to load categories for dashboard filter:', err);
      }
    };
    loadCategories();
  }, []);

  // View States
  const [viewMode, setViewMode] = useState('card'); // table vs card
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Mobile Filters toggle drawer state
  const [adminFiltersOpen, setAdminFiltersOpen] = useState(false);

  const renderAdminStars = (rating) => {
    const score = Math.round(parseFloat(rating || 5));
    return (
      <div className="admin-stars-container" title={`Rating: ${score}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < score ? '#ff6b00' : 'none'}
            className={`admin-star-icon ${i < score ? 'active' : 'inactive'}`}
          />
        ))}
      </div>
    );
  };

  // Custom Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    productId: null,
    productName: '',
    isDeleting: false
  });

  // Dynamically set admin page title
  useEffect(() => {
    document.title = "GearCart Admin | Inventory Control";
  }, []);

  // Debounce search queries to reduce DB hits
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch dynamic products on filter/page modification
  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy
      };

      if (debouncedSearch.trim()) {
        params.q = debouncedSearch.trim();
      }

      if (availability === 'available') {
        params.is_available = 'true';
      } else if (availability === 'out') {
        params.is_available = 'false';
      }

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      const data = await adminApi.getProducts(params);

      // DRF paginated responses contain count, results, etc.
      setProducts(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch hardware catalog from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, sortBy, availability, categoryFilter, currentPage, pageSize]);

  // Dynamic Statistics
  const totalStockUnits = products.reduce((acc, curr) => acc + parseInt(curr.stock || 0), 0);
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  // Trigger custom delete confirmation modal
  const handleDeleteTrigger = (productId, name) => {
    setDeleteConfirm({
      isOpen: true,
      productId,
      productName: name,
      isDeleting: false
    });
  };

  // Perform backend product deletion
  const executeDelete = async () => {
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    try {
      await adminApi.deleteProduct(deleteConfirm.productId);
      showNotification(`Product "${deleteConfirm.productName}" deleted successfully.`);
      setDeleteConfirm({ isOpen: false, productId: null, productName: '', isDeleting: false });
      // If last item on page deleted, shift back
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not delete product.');
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Open Edit Form
  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form Save Callback
  const handleFormSave = (savedProduct, actionType) => {
    setIsFormOpen(false);
    setProductToEdit(null);
    showNotification(
      actionType === 'edit'
        ? `Product updated successfully!`
        : `Product created successfully!`
    );
    fetchProducts();
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 4500);
  };

  // Pagination buttons logic
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in">

      {/* Dynamic Visual Notification */}
      {notification && (
        <Alert
          message={notification}
          type="success"
          onClose={() => setNotification('')}
          className="admin-alert"
        />
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage('')}
          className="admin-alert"
        />
      )}

      {/* Title & Add Button Row */}
      <div className="admin-header-row">
        <div className="admin-header-title-area">
          <h1 className="admin-header-title">
            Product Management
          </h1>
          <p className="admin-header-subtitle">
            Inspect statistics, add new products, and manage catalog inventory.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setProductToEdit(null);
            setIsFormOpen(true);
          }}
          className="admin-add-product-btn"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Button>
      </div>

      {/* --- PREMIUM GLASSMORPHIC SIDE DRAWER (RENDERED VIA PORTAL) --- */}
      {createPortal(
        <div
          className={`drawer-backdrop ${isFormOpen ? 'open' : ''}`}
          onClick={() => {
            setIsFormOpen(false);
            setProductToEdit(null);
          }}
        >
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2 className="admin-drawer-title">
                  {productToEdit ? 'Edit Product Details' : 'Add New Product'}
                </h2>
                <p className="admin-drawer-subtitle">
                  Provide product specifications, visual assets, and stock parameters.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setProductToEdit(null);
                }}
                className="admin-drawer-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              <AddProductForm
                productToEdit={productToEdit}
                onSave={(product, mode) => {
                  handleFormSave(product, mode);
                  setIsFormOpen(false);
                  setProductToEdit(null);
                }}
                onCancel={() => {
                  setIsFormOpen(false);
                  setProductToEdit(null);
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Quick Statistics Banner */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper primary">
            <Laptop size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Total Products</span>
            <span className="admin-stat-value">{totalCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper success">
            <Package size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Total Stock</span>
            <span className="admin-stat-value">{totalStockUnits}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className={`admin-stat-icon-wrapper ${outOfStockCount > 0 ? 'danger' : 'warning'}`}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Out of Stock</span>
            <span className="admin-stat-value">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD LIST CONTROLS BAR --- */}
      <div className="admin-controls-wrapper">

        {/* Left side: Search Input, View Mode Toggle, and Mobile Filter Toggle Button */}
        <div className="admin-controls-left">

          <div className="search-bar-responsive">
            <span className="admin-control-section-label">
              Search Products
            </span>
            <div className="admin-search-wrapper">
              <div className="admin-search-icon-wrapper">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search Products by title or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          {/* View Mode Toggle Buttons (Always visible on mobile!) */}
          <div className="admin-mobile-viewmode-container">
            <span className="admin-viewmode-label admin-control-section-label">
              View
            </span>
            <div className="admin-viewmode-button-group">
              <button
                onClick={() => setViewMode('table')}
                className={`admin-viewmode-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table Spreadsheet View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`admin-viewmode-btn ${viewMode === 'card' ? 'active' : ''}`}
                title="Grid Cards View"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>

          {/* Compact Filter Toggle Icon for Mobile */}
          <div className="admin-mobile-filter-container">
            <span className="admin-filter-label admin-control-section-label">
              Filter
            </span>
            <button
              type="button"
              className={`admin-mobile-filter-toggle ${adminFiltersOpen ? 'active' : ''}`}
              onClick={() => setAdminFiltersOpen(!adminFiltersOpen)}
            >
              <Filter size={16} />
            </button>
          </div>

        </div>

        {/* Right side: Grouped Dropdowns & Layout Toggles */}
        <div className={`filters-group-responsive ${adminFiltersOpen ? 'open' : ''}`}>
          {/* Category Filter */}
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categoriesList.map(c => ({ value: c.id, label: c.name }))
            ]}
            className="admin-select-category"
          />

          {/* Availability Filter */}
          <Select
            label="Availability"
            value={availability}
            onChange={(val) => { setAvailability(val); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Items' },
              { value: 'available', label: 'In Stock' },
              { value: 'out', label: 'Sold Out' }
            ]}
            className="admin-select-compact"
          />

          {/* Sort filter */}
          <Select
            label="Sort By"
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'price_asc', label: 'Price: Low to High' },
              { value: 'price_desc', label: 'Price: High to Low' },
              { value: 'rating', label: 'Rating Reviews' }
            ]}
            className="admin-select-compact"
          />

          {/* View Mode Toggle Buttons for Web view last in row */}
          <div className="admin-web-viewmode-container">
            <span className="admin-control-section-label">
              View
            </span>
            <div className="admin-viewmode-button-group">
              <button
                onClick={() => setViewMode('table')}
                className={`admin-viewmode-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table Spreadsheet View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`admin-viewmode-btn ${viewMode === 'card' ? 'active' : ''}`}
                title="Grid Cards View"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay Spinner */}
      {isLoading ? (
        <div className="admin-loading-wrapper">
          <div className="admin-loading-spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="admin-empty-state">
          <Package size={48} className="admin-empty-icon" />
          <h3>No Products Found</h3>
          <p>Try adjusting your filters, query terms, or add a new product.</p>
        </div>
      ) : viewMode === 'table' ? (

        // --- 1. TABLE INVENTORY VIEW ---
        <div className="admin-table-container animate-fade-in">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-header-row">
                <th style={{ padding: '16px' }}>Product</th>
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>SKU</th>
                <th style={{ padding: '16px' }}>Price</th>
                <th style={{ padding: '16px' }}>Stock</th>
                <th style={{ padding: '16px' }}>Availability</th>
                <th style={{ padding: '16px' }}>Rating</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="table-row-hover admin-table-row"
                >
                  <td className="admin-td-product">
                    <SafeAdminImage
                      src={p.image}
                      alt={p.name}
                      className="admin-td-img"
                    />
                    <span className="admin-td-name">{p.name}</span>
                  </td>
                  <td className="admin-td-standard">
                    <span className="admin-badge-primary">
                      {p.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="admin-td-sku">
                    {p.sku}
                  </td>
                  <td className="admin-td-price">
                    ${parseFloat(p.price).toFixed(2)}
                  </td>
                  <td className="admin-td-stock">
                    {p.stock} items
                  </td>
                  <td className="admin-td-standard">
                    <span className={`admin-badge-${p.stock > 0 ? 'success' : 'danger'}`}>
                      {p.stock > 0 ? 'In Stock' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="admin-td-standard">
                    {renderAdminStars(p.rating)}
                  </td>
                  <td className="admin-td-actions">
                    <div className="admin-actions-wrapper">
                      <Button
                        variant="outline"
                        onClick={() => handleEditClick(p)}
                        className="admin-action-btn"
                        title="Edit product"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteTrigger(p.id, p.name)}
                        className="admin-action-btn delete"
                        title="Delete product"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (

        // --- 2. CARD DENSITY GRID VIEW ---
        <div className="admin-grid-view animate-fade-in">
          {products.map((p) => (
            <div
              key={p.id}
              className="admin-product-card"
            >
              <div className="admin-card-img-wrapper">
                <SafeAdminImage
                  src={p.image}
                  alt={p.name}
                  className="admin-card-img"
                />
                <span className={`admin-card-badge ${p.stock > 0 ? 'success' : 'danger'}`}>
                  {p.stock > 0 ? 'Available' : 'Out of Stock'}
                </span>
              </div>

              <div className="admin-card-body">
                <div className="admin-card-meta">
                  <span className="admin-card-sku">
                    {p.sku}
                  </span>
                  <span className="admin-card-category">
                    {p.category_name || 'Uncategorized'}
                  </span>
                </div>
                <h3 className="admin-card-title">
                  {p.name}
                </h3>
                <div className="admin-card-stars">
                  {renderAdminStars(p.rating)}
                </div>
                <p className="admin-card-desc">
                  {p.description || 'No description registered.'}
                </p>

                <div className="admin-card-pricing-row">
                  <div>
                    <span className="admin-card-pricing-label">PRICE</span>
                    <span className="admin-card-price-value">
                      ${parseFloat(p.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="admin-card-stock-col">
                    <span className="admin-card-pricing-label">STOCK</span>
                    <span className="admin-card-stock-value">
                      {p.stock} items
                    </span>
                  </div>
                </div>

                <div className="admin-card-actions">
                  <Button
                    variant="outline"
                    onClick={() => handleEditClick(p)}
                    className="admin-card-btn"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteTrigger(p.id, p.name)}
                    className="admin-card-btn delete"
                  >
                    <Trash size={14} />
                    <span>Delete</span>
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PAGINATION CONTROLS FOOTER --- */}
      {!isLoading && totalPages > 1 && (
        <div className="admin-pagination-wrapper">
          <span className="admin-pagination-info">
            Showing{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {(currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {Math.min(currentPage * pageSize, totalCount)}
            </strong>{' '}
            of <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> products
          </span>

          <div className="admin-pagination-buttons">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="admin-page-nav-btn"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
              <button
                key={pageNo}
                onClick={() => handlePageChange(pageNo)}
                className={`admin-page-btn ${currentPage === pageNo ? 'active' : ''}`}
              >
                {pageNo}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="admin-page-nav-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* --- PREMIUM GLASSMORPHIC DELETE CONFIRMATION MODAL (PORTAL) --- */}
      {deleteConfirm.isOpen && createPortal(
        <div
          className="admin-modal-backdrop animate-fade-in"
          onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="admin-modal-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-icon">
              <Trash size={26} />
            </div>

            <div>
              <h3 className="admin-modal-title">
                Delete Product
              </h3>
              <p className="admin-modal-desc">
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteConfirm.productName}"</strong>? This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="admin-modal-actions">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                disabled={deleteConfirm.isDeleting}
                className="admin-modal-btn"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={executeDelete}
                isLoading={deleteConfirm.isDeleting}
                className="admin-modal-btn delete"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminDashboard;
export { AdminDashboard };
