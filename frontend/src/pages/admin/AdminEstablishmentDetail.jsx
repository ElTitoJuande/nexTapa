// src/pages/admin/AdminEstablishmentDetail.jsx
// Página de detalle/edición de un establecimiento en el panel de administración

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { establishmentService } from '../../services/establishmentService';
import './styles/admin.css';

import { EstablishmentItems } from './adminComponents/ItemsAdmin';
import { EstablishmentStatus } from './adminComponents/StatusAdmin';
import { BasicInformationAdmin } from './adminComponents/BasicInformationAdmin';
import { CuisineTypeAdmin } from './adminComponents/CuisineTypeAdmin';
import { AdressAdmin } from './adminComponents/AdressAdmin';
import { MapboxPicker } from './adminComponents/MapboxPicker';
import { ContactAdmin } from './adminComponents/ContactAdmin';
import { ScheduleAdmin } from './adminComponents/ScheduleAdmin';
import { FeaturesAdmin } from './adminComponents/FeaturesAdmin';
import { ViewInAppButton } from './adminComponents/ViewInAppButton';
import { EstablishmentPhotosAdmin } from './adminComponents/EstablishmentPhotosAdmin';

const EMPTY_FORM = { // Estructura inicial vacía para un nuevo establecimiento
   name: '',
   slug: '',
   description: '',
   mainImage: '',
   type: 'bar',
   cuisineType: [],
   address: { street: '', number: '', city: '', province: '', postalCode: '', country: 'España' },
   location: { type: 'Point', coordinates: [-3.7038, 40.4168] },
   phone: '',
   email: '',
   website: '',
   schedule: {
      lunes:     { open: '', close: '', closed: true },
      martes:    { open: '', close: '', closed: true },
      miercoles: { open: '', close: '', closed: true },
      jueves:    { open: '', close: '', closed: true },
      viernes:   { open: '', close: '', closed: true },
      sabado:    { open: '', close: '', closed: true },
      domingo:   { open: '', close: '', closed: true },
   },
   features: [],
   priceRange: '€€',
   owner: '',
   verified: false,
   active: true,
};

export const AdminEstablishmentDetail = () => { // Componente principal para crear/editar un establecimiento en el panel admin
   const { id } = useParams();
   const navigate = useNavigate();
   const isNew = id === 'new';
   const [loading, setLoading] = useState(!isNew);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [successMsg, setSuccessMsg] = useState(null);
   const [form, setForm] = useState(EMPTY_FORM);

   useEffect(() => {
      if (isNew) {return;}

      const load = async () => {
         try {
            setLoading(true);
            const res = await establishmentService.getById(id);
            const est = res.data;
            setForm({
               name: est.name || '',
               slug: est.slug || '',
               description: est.description || '',
               mainImage: est.mainImage || est.image || '',
               type: est.type || 'bar',
               cuisineType: est.cuisineType || [],
               address: {
                  street: est.address?.street || '',
                  number: est.address?.number || '',
                  city: est.address?.city || '',
                  province: est.address?.province || '',
                  postalCode: est.address?.postalCode || '',
                  country: est.address?.country || 'España',
               },
               location: { type: 'Point', coordinates: est.location?.coordinates || [0, 0] },
               phone: est.phone || '',
               email: est.email || '',
               website: est.website || '',
               schedule: {
                  lunes:     { open: est.schedule?.lunes?.open || '',     close: est.schedule?.lunes?.close || '',     closed: est.schedule?.lunes?.closed ?? true },
                  martes:    { open: est.schedule?.martes?.open || '',    close: est.schedule?.martes?.close || '',    closed: est.schedule?.martes?.closed ?? true },
                  miercoles: { open: est.schedule?.miercoles?.open || '', close: est.schedule?.miercoles?.close || '', closed: est.schedule?.miercoles?.closed ?? true },
                  jueves:    { open: est.schedule?.jueves?.open || '',    close: est.schedule?.jueves?.close || '',    closed: est.schedule?.jueves?.closed ?? true },
                  viernes:   { open: est.schedule?.viernes?.open || '',   close: est.schedule?.viernes?.close || '',   closed: est.schedule?.viernes?.closed ?? true },
                  sabado:    { open: est.schedule?.sabado?.open || '',    close: est.schedule?.sabado?.close || '',    closed: est.schedule?.sabado?.closed ?? true },
                  domingo:   { open: est.schedule?.domingo?.open || '',   close: est.schedule?.domingo?.close || '',   closed: est.schedule?.domingo?.closed ?? true },
               },
               features: est.features || [], 
               priceRange: est.priceRange || '',
               verified: est.verified || false,
               active: est.active !== undefined ? est.active : true,
               owner: est.owner?._id || est.owner || '',
            });
         } catch (err) {
            setError('Error loading establishment');
         } finally {
            setLoading(false);
         }
      };
      load();
   }, [id]);

   // ── Handlers ───────────────────────────────────────────────────────

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
   };

   const handleAddress = (e) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
   };

   const handleScheduleChange = (day, field, value) => {
      setForm(prev => ({
         ...prev,
         schedule: { ...prev.schedule, [day]: { ...prev.schedule[day], [field]: value } }// 
      }));
   };

   const handleMapCoordinates = (newCoords) => {
      setForm(prev => ({ ...prev, location: { type: 'Point', coordinates: newCoords } }));
   };

   const handleAddressFromMap = (newAddress) => {
      setForm(prev => ({ ...prev, address: { ...prev.address, ...newAddress } }));
   };

   const handleCoordinatesFromAddress = (newCoords) => {
      setForm(prev => ({ ...prev, location: { type: 'Point', coordinates: newCoords } }));
   };

   const handleSubmit = async (e) => { 
      e.preventDefault();
      setError(null);
      setSuccessMsg(null);
      setSaving(true);
      try {
         if (isNew) {
            const res = await establishmentService.create(form);
            const newId = res.data._id;
            navigate(`/admin/establishments/${newId}`);
         } else {
            await establishmentService.update(id, form);
            setSuccessMsg('Establecimiento actualizado correctamente');
            setTimeout(() => setSuccessMsg(null), 3000);
         }
      } catch (err) {
         setError(err.response?.data?.message || `Error al ${isNew ? 'crear' : 'actualizar'} el establecimiento`);
      } finally {
         setSaving(false);
      }
   };

   if (loading) {return <p className="admin-loading">Loading...</p>;}

   return (
      <div className="admin-page">
         <div className="admin-page-header">
            <button className="admin-btn admin-btn-secondary" onClick={() => navigate('/admin/establishments')}>
               ← Back
            </button>
            <h1 className="admin-title">
               {isNew ? 'Nuevo Establecimiento' : `Editar: ${form.name}`}
            </h1>
            {!isNew && <ViewInAppButton id={id} />}
         </div>

         {error && <div className="admin-alert admin-alert-error">{error}</div>}
         {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}

         <form onSubmit={handleSubmit} className="admin-form">

            {/* Owner: solo visible al crear */}
            {isNew && (
               <div className="admin-section">
                  <h2 className="admin-section-title">Propietario</h2>
                  <div className="admin-field">
                     <label className="admin-label">Owner ID </label>
                     <input
                        className="admin-input"
                        name="owner"
                        value={form.owner}
                        onChange={handleChange}
                        placeholder="Dejar vacío o ingresar ID de usuario propietario"
                        //required
                     />
                     <span className="admin-hint">Puedes obtenerlo desde la sección Usuarios</span>
                  </div>
               </div>
            )}

            {/* Fila 1: Status + Contact */}
            <div className="admin-row">
               {!isNew && <EstablishmentStatus active={form.active} verified={form.verified} onChange={handleChange} name={form.name} saving={saving} />}
               <ContactAdmin contact={{ phone: form.phone, email: form.email, website: form.website }} onChange={handleChange} saving={saving} />
            </div>

            {/* Fila 2: Basic Info + Schedule */}
            <div className="admin-row">
               <BasicInformationAdmin form={form} onChange={handleChange} saving={saving} />
               <ScheduleAdmin schedule={form.schedule} onChange={handleScheduleChange} saving={saving} />
            </div>

            {/* Fila 3: Features + Cuisine Type */}
            <div className="admin-row">
               <FeaturesAdmin
                  features={form.features}
                  onAdd={f => setForm(prev => ({ ...prev, features: [...prev.features, f] }))}
                  onRemove={f => setForm(prev => ({ ...prev, features: prev.features.filter(ft => ft !== f) }))}
                  saving={saving}
               />
               <CuisineTypeAdmin
                  cuisineType={form.cuisineType}
                  onAdd={c => setForm(prev => ({ ...prev, cuisineType: [...prev.cuisineType, c] }))}
                  onRemove={c => setForm(prev => ({ ...prev, cuisineType: prev.cuisineType.filter(ct => ct !== c) }))}
                  saving={saving}
               />
            </div>

            {/* Fila 4: Dirección + Mapa */}
            <div className="admin-row">
               <AdressAdmin
                  address={form.address}
                  onChange={handleAddress}
                  onCoordinatesChange={handleCoordinatesFromAddress}
                  saving={saving}
               />
               <MapboxPicker
                  coordinates={form.location.coordinates}
                  onChange={handleMapCoordinates}
                  onAddressChange={handleAddressFromMap}
                  saving={saving}
               />
            </div>

            <div className="admin-form-footer">
               <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                  {saving
                     ? (isNew ? 'Creando...' : 'Guardando...')
                     : (isNew ? 'Crear Establecimiento' : 'Guardar Cambios')
                  }
               </button>
            </div>

         </form>

         {/* Sección de medios e items: solo en modo edición */}
         {!isNew && (
            <div className="admin-row">
               <EstablishmentPhotosAdmin 
                  establishmentId={id}
                  mainImage={form.mainImage}
                  onMainImageChange={(url) => setForm(prev => ({ ...prev, mainImage: url }))}
               />
               <EstablishmentItems establishmentId={id} />
            </div>
         )}

         {!isNew && <ViewInAppButton id={id} />}

      </div>
   );
};