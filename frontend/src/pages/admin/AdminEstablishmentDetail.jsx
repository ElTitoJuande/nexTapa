// src/pages/admin/AdminEstablishmentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { establishmentService } from '../../services/establishmentService';
import { toastService } from '../../services/toastService';
import './styles/admin.css';

// Componentes
import { EstablishmentItems } from "./adminComponents/EstablishmentItemsAdmin";
import { EstablishmentStatus } from "./adminComponents/StatusAdmin";
import { BasicInformationAdmin } from "./adminComponents/BasicInformationAdmin";
import { CuisineTypeAdmin } from "./adminComponents/CuisineTypeAdmin";
import { AdressAdmin } from "./adminComponents/AdressAdmin";
import { MapboxPicker } from "./adminComponents/MapboxPicker";
import { ContactAdmin } from "./adminComponents/ContactAdmin";
import { SocialLinksAdmin } from "./adminComponents/SocialLinksAdmin";
import { ScheduleAdmin } from "./adminComponents/ScheduleAdmin";
import { FeaturesAdmin } from "./adminComponents/FeaturesAdmin";
import { ViewInAppButton } from "./adminComponents/ViewInAppButton";
import { EstablishmentPhotosAdmin } from "./adminComponents/EstablishmentPhotosAdmin";

const makeDay = (closed = false, open = "09:00", close = "00:00") => ({
   open, close, split: false,
   afternoon: { open: "", close: "" },
   closed,
});

const mapDay = (d) => ({
   open: d?.open || "",
   close: d?.close || "",
   split: d?.split ?? false,
   afternoon: d?.afternoon ?? { open: "", close: "" },
   closed: d?.closed ?? true,
});

const EMPTY_FORM = {
   name: "", slug: "", description: "", mainImage: "",
   type: "bar", cuisineType: [],
   address: { street: "", number: "", city: "", province: "", postalCode: "", country: "España" },
   location: { type: "Point", coordinates: [-3.7038, 40.4168] },
   phone: "", email: "", website: "",
   socialLinks: { instagram: "", facebook: "", twitter: "", googleBusiness: "" },
   schedule: {
      lunes: makeDay(true), martes: makeDay(false), miercoles: makeDay(false),
      jueves: makeDay(false), viernes: makeDay(false), sabado: makeDay(false), domingo: makeDay(false),
   },
   features: [], priceRange: "€€", owner: "", verified: false, active: true,
};

export const AdminEstablishmentDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const isNew = id === "new";

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
               ...EMPTY_FORM,
               ...est,
               address: { ...EMPTY_FORM.address, ...est.address },
               location: { type: "Point", coordinates: est.location?.coordinates || [0, 0] },
               socialLinks: { ...EMPTY_FORM.socialLinks, ...est.socialLinks },
               schedule: {
                  lunes: mapDay(est.schedule?.lunes),
                  martes: mapDay(est.schedule?.martes),
                  miercoles: mapDay(est.schedule?.miercoles),
                  jueves: mapDay(est.schedule?.jueves),
                  viernes: mapDay(est.schedule?.viernes),
                  sabado: mapDay(est.schedule?.sabado),
                  domingo: mapDay(est.schedule?.domingo),
               },
               owner: est.owner?._id || est.owner || "",
            });
         } catch (err) {
            setError("Error al cargar el establecimiento");
         } finally {
            setLoading(false);
         }
      };
      load();
   }, [id, isNew]);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
   };

   const handleAddress = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
   };

   const handleScheduleChange = (day, field, value) => {
      setForm((prev) => {
         const prevDay = prev.schedule[day] || {};
         const updatedDay = field === "afternoon"
            ? { ...prevDay, afternoon: { ...prevDay.afternoon, ...value } }
            : { ...prevDay, [field]: value };
         return { ...prev, schedule: { ...prev.schedule, [day]: updatedDay } };
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         if (isNew) {
            const res = await establishmentService.create(form);
            toastService.success("Establecimiento creado correctamente");
            navigate(`/admin/establishments/${res.data._id}`);
         } else {
            await establishmentService.update(id, form);
            setSuccessMsg("Guardado correctamente");
            toastService.success("Cambios guardados correctamente");
            setTimeout(() => setSuccessMsg(null), 3000);
         }
      } catch (err) {
         setError("Error al guardar");
         toastService.error("Error al guardar el establecimiento");
      } finally {
         setSaving(false);
      }
   };

   if (loading) {return <p className="admin-loading">Cargando...</p>;}

   return (
      <div className="admin-page">
         <div className="admin-page-header">
            <button className="admin-btn admin-btn-secondary" onClick={() => navigate("/admin/establishments")}>← Volver</button>
            <h1 className="admin-title">{isNew ? "Nuevo" : `Editar: ${form.name}`}</h1>
            {!isNew && <ViewInAppButton slug={form.slug} />}
         </div>

         {error && <div className="admin-alert admin-alert-error">{error}</div>}
         {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}

         <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-row">
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!isNew && <EstablishmentStatus active={form.active} verified={form.verified} onChange={handleChange} saving={saving} />}
                  <ContactAdmin contact={{ phone: form.phone, email: form.email, website: form.website }} onChange={handleChange} saving={saving} />
               </div>
               <SocialLinksAdmin socialLinks={form.socialLinks} establishmentId={id} isNew={isNew} onChange={(links) => setForm(p => ({ ...p, socialLinks: links }))} saving={saving} />
            </div>

            <div className="admin-row">
               <BasicInformationAdmin form={form} onChange={handleChange} saving={saving} />
               <ScheduleAdmin schedule={form.schedule} onChange={handleScheduleChange} saving={saving} />
            </div>

            <div className="admin-row">
               <FeaturesAdmin features={form.features} onAdd={f => setForm(p => ({ ...p, features: [...p.features, f] }))} onRemove={f => setForm(p => ({ ...p, features: p.features.filter(x => x !== f) }))} saving={saving} />
               <CuisineTypeAdmin cuisineType={form.cuisineType} onAdd={c => setForm(p => ({ ...p, cuisineType: [...p.cuisineType, c] }))} onRemove={c => setForm(p => ({ ...p, cuisineType: p.cuisineType.filter(x => x !== c) }))} saving={saving} />
            </div>

            <div className="admin-row">
               <AdressAdmin address={form.address} onChange={handleAddress} onCoordinatesChange={c => setForm(p => ({ ...p, location: { type: "Point", coordinates: c } }))} saving={saving} />
               <MapboxPicker coordinates={form.location.coordinates} onChange={c => setForm(p => ({ ...p, location: { type: "Point", coordinates: c } }))} onAddressChange={a => setForm(p => ({ ...p, address: { ...p.address, ...a } }))} saving={saving} />
            </div>

            <div className="admin-form-footer">
               <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                  {saving ? "Guardando..." : "Guardar Cambios"}
               </button>
            </div>
         </form>

         {!isNew && (
            <div className="admin-row">
               <EstablishmentPhotosAdmin establishmentId={id} mainImage={form.mainImage} onMainImageChange={url => setForm(p => ({ ...p, mainImage: url }))} />
               <EstablishmentItems establishmentId={id} />
            </div>
         )}
      </div>
   );
};
