import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE_URL } from '../../lib/api-client';
import { Camera, Save, User, MapPin, Briefcase, Globe, Loader2, Link2, Check } from 'lucide-react';

export default function AgentProfileForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [agentId, setAgentId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        phone: '',
        email: '',
        bio: '',
        fullBio: '',
        whatsapp: '',
        lineId: '',
        facebook: '',
        linkedin: '',
        instagram: '',
        licenseNumber: '',
        experienceYears: 0,
        languages: [] as string[],
        serviceAreas: [] as string[],
        officeAddress: '',
        photoId: null as number | null,
        photoUrl: ''
    });

    useEffect(() => {
        const loadProfile = async () => {
            const user = apiClient.getUser();
            if (!user || user.role !== 'agent' || !user.agent) {
                setLoading(false);
                return;
            }

            try {
                const id = typeof user.agent === 'object' ? user.agent.id : user.agent;
                setAgentId(id);

                // Fetch full agent details from API
                const response = await fetch(`${API_BASE_URL}/api/agents/${id}?depth=1`);
                if (response.ok) {
                    const agent = await response.json();

                    let photoUrl = '';
                    let photoId = null;
                    if (agent.photo && typeof agent.photo === 'object') {
                        photoId = agent.photo.id;
                        photoUrl = agent.photo.url.startsWith('http') ? agent.photo.url : `${API_BASE_URL}${agent.photo.url}`;
                    }

                    setFormData({
                        name: agent.name || '',
                        role: agent.role || 'agent',
                        phone: agent.phone || '',
                        email: agent.email || '',
                        bio: agent.bio || '',
                        fullBio: agent.fullBio || '',
                        whatsapp: agent.whatsapp || '',
                        lineId: agent.lineId || '',
                        facebook: agent.facebook || '',
                        linkedin: agent.linkedin || '',
                        instagram: agent.instagram || '',
                        licenseNumber: agent.licenseNumber || '',
                        experienceYears: agent.experienceYears || 0,
                        languages: agent.languages || [],
                        serviceAreas: agent.serviceAreas || [],
                        officeAddress: agent.officeAddress || '',
                        photoId: photoId,
                        photoUrl: photoUrl
                    });
                }
            } catch (err) {
                console.error("Failed to load agent profile", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Read visually right away
            const objectUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, photoUrl: objectUrl }));

            // Upload to payload
            const uploadedMedia = await apiClient.uploadMedia(file);
            if (uploadedMedia?.doc?.id) {
                setFormData(prev => ({ ...prev, photoId: uploadedMedia.doc.id }));
            }
        } catch (err) {
            console.error("Failed to upload photo", err);
            alert("Failed to upload photo. Please try again.");
        }
    };

    const handleArrayInput = (e: React.KeyboardEvent<HTMLInputElement>, field: 'languages' | 'serviceAreas') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !formData[field].includes(val)) {
                setFormData(prev => ({ ...prev, [field]: [...prev[field], val] }));
                e.currentTarget.value = '';
            }
        }
    };

    const removeArrayItem = (field: 'languages' | 'serviceAreas', itemToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item !== itemToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agentId) return;

        setSaving(true);
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('payload_token');
            const dataToSave = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                bio: formData.bio,
                fullBio: formData.fullBio,
                whatsapp: formData.whatsapp,
                lineId: formData.lineId,
                facebook: formData.facebook,
                linkedin: formData.linkedin,
                instagram: formData.instagram,
                licenseNumber: formData.licenseNumber,
                experienceYears: Number(formData.experienceYears),
                languages: formData.languages,
                serviceAreas: formData.serviceAreas,
                officeAddress: formData.officeAddress,
                photo: formData.photoId
            };

            const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${token}`
                },
                body: JSON.stringify(dataToSave)
            });

            if (response.ok) {
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save profile. Please see console.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="apf-loading"><Loader2 className="animate-spin" /> Loading Profile...</div>;
    if (!agentId) return <div className="apf-error">Agent profile not found.</div>;

    return (
        <form onSubmit={handleSubmit} className="apf-container">
            {/* Header section w/ Save */}
            <div className="apf-header">
                <div>
                    <h2 className="apf-title">Agent Profile</h2>
                    <p className="apf-description">Manage your public professional presence.</p>
                </div>
                <div className="apf-actions">
                    {successMessage && <span className="apf-success"><Check size={16} /> Saved</span>}
                    <button type="submit" disabled={saving} className="apf-btn-primary">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="apf-grid">
                {/* Left Column: Visuals & Socials */}
                <div className="apf-col">
                    {/* Avatar Upload */}
                    <div className="apf-card">
                        <h3 className="apf-card-title"><User size={18} /> Profile Picture</h3>
                        <div className="apf-avatar-upload">
                            <div className="apf-avatar-preview">
                                {formData.photoUrl ? (
                                    <img src={formData.photoUrl} alt="Agent Avatar" className="apf-avatar-img" />
                                ) : (
                                    <img
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.name || 'Agent')}&backgroundColor=3b82f6&textColor=ffffff`}
                                        alt="Profile Placeholder"
                                        className="apf-avatar-img"
                                    />
                                )}
                            </div>
                            <div className="apf-upload-controls">
                                <label className="apf-upload-lbl">
                                    <Camera size={14} /> Upload New Photo
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                </label>
                                {formData.photoUrl && (
                                    <button
                                        type="button"
                                        className="apf-upload-lbl"
                                        style={{ marginTop: '0.2rem', color: '#ef4444', borderColor: '#fecaca', background: 'transparent' }}
                                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '', photoId: null }))}
                                    >
                                        Remove Photo
                                    </button>
                                )}
                                <p className="apf-hint" style={{ marginTop: '0.5rem' }}>Recommended format: Square 500x500px, JPG or PNG.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Socials */}
                    <div className="apf-card">
                        <h3 className="apf-card-title"><Link2 size={18} /> Connect Links</h3>
                        <div className="apf-field-group">
                            <label>WhatsApp Number</label>
                            <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+66 8X XXX XXXX" />
                        </div>
                        <div className="apf-field-group">
                            <label>LINE ID</label>
                            <input type="text" name="lineId" value={formData.lineId} onChange={handleChange} placeholder="@yourlineid" />
                        </div>
                        <div className="apf-field-group">
                            <label>LinkedIn Profile</label>
                            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                        </div>
                        <div className="apf-field-group">
                            <label>Instagram / Facebook</label>
                            <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username or URL" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="apf-col apf-span-2">
                    <div className="apf-card">
                        <h3 className="apf-card-title"><Briefcase size={18} /> Professional Details</h3>
                        <div className="apf-row-2">
                            <div className="apf-field-group">
                                <label>Full Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="apf-field-group">
                                <label>Role (View Only)</label>
                                <input type="text" value={formData.role.replace('_', ' ').toUpperCase()} disabled className="apf-disabled" />
                            </div>
                        </div>
                        <div className="apf-row-2">
                            <div className="apf-field-group">
                                <label>Phone</label>
                                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+66..." />
                            </div>
                            <div className="apf-field-group">
                                <label>Email address</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="apf-card">
                        <h3 className="apf-card-title"><Globe size={18} /> Biography & Experience</h3>
                        <div className="apf-field-group">
                            <label>Short Bio (Headline)</label>
                            <input type="text" name="bio" value={formData.bio} onChange={handleChange} placeholder="e.g. Luxury Condo Specialist in Sukhumvit" maxLength={100} />
                            <span className="apf-hint">Max 100 characters. Shown prominently on listings.</span>
                        </div>
                        <div className="apf-field-group">
                            <label>Full Biography</label>
                            <textarea name="fullBio" value={formData.fullBio} onChange={handleChange} rows={5} placeholder="Describe your background, expertise, and how you help clients..." />
                        </div>
                        <div className="apf-row-2">
                            <div className="apf-field-group">
                                <label>Years of Experience</label>
                                <input type="number" min="0" name="experienceYears" value={formData.experienceYears} onChange={handleChange} />
                            </div>
                            <div className="apf-field-group">
                                <label>License / Accreditation #</label>
                                <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="Optional" />
                            </div>
                        </div>
                    </div>

                    <div className="apf-card">
                        <h3 className="apf-card-title"><MapPin size={18} /> Specialties & Areas</h3>
                        <div className="apf-row-2">
                            <div className="apf-field-group">
                                <label>Languages Spoken <span className="apf-hint">(Press Enter to add)</span></label>
                                <input type="text" placeholder="e.g. English, Thai" onKeyDown={(e) => handleArrayInput(e, 'languages')} />
                                <div className="apf-tags">
                                    {formData.languages.map(lang => (
                                        <span key={lang} className="apf-tag">{lang} <button type="button" onClick={() => removeArrayItem('languages', lang)}>&times;</button></span>
                                    ))}
                                </div>
                            </div>
                            <div className="apf-field-group">
                                <label>Service Neighborhoods <span className="apf-hint">(Press Enter to add)</span></label>
                                <input type="text" placeholder="e.g. Thong Lo, Sathorn" onKeyDown={(e) => handleArrayInput(e, 'serviceAreas')} />
                                <div className="apf-tags">
                                    {formData.serviceAreas.map(area => (
                                        <span key={area} className="apf-tag">{area} <button type="button" onClick={() => removeArrayItem('serviceAreas', area)}>&times;</button></span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="apf-field-group">
                            <label>Office Address</label>
                            <textarea name="officeAddress" value={formData.officeAddress} onChange={handleChange} rows={2} placeholder="Physical branch or office location..." />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Styling purely for the form */
                .apf-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    width: 100%;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .apf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                }

                .apf-title { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; }
                .apf-description { font-size: 0.85rem; color: var(--text-muted); }

                .apf-actions { display: flex; align-items: center; gap: 1rem; }
                .apf-success { color: #10b981; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 0.3rem; }
                
                .apf-btn-primary {
                    background: var(--accent-primary, #3b82f6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 0.6rem 1.25rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .apf-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
                .apf-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                .apf-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 1.5rem;
                }
                @media (max-width: 768px) {
                    .apf-grid { grid-template-columns: 1fr; }
                }

                .apf-col { display: flex; flex-direction: column; gap: 1.5rem; }
                .apf-span-2 { /* In grid terms */ }

                .apf-card {
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .apf-card-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-main);
                    border-bottom: 1px solid var(--border-subtle);
                    padding-bottom: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .apf-avatar-upload {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 0;
                }

                .apf-avatar-preview {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: var(--bg-glass);
                    border: 2px dashed var(--border-medium);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    color: var(--text-dim);
                }

                .apf-avatar-img { width: 100%; height: 100%; object-fit: cover; }
                
                .apf-upload-controls { text-align: center; display: flex; flex-direction: column; gap: 0.5rem; align-items: center;}
                
                .apf-upload-lbl {
                    background: var(--bg-main);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-main);
                    font-size: 0.8rem;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: background 0.2s;
                }
                .apf-upload-lbl:hover { background: var(--bg-glass); }

                .apf-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .apf-row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }
                @media (max-width: 600px) {
                    .apf-row-2 { grid-template-columns: 1fr; }
                }

                .apf-field-group label { font-size: 0.85rem; font-weight: 500; color: var(--text-muted); }
                .apf-hint { font-size: 0.75rem; color: var(--text-dim); font-weight: 400; margin-left: auto; }

                .apf-field-group input, .apf-field-group textarea {
                    width: 100%;
                    background: var(--bg-main);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-main);
                    padding: 0.6rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }
                .apf-field-group input:focus, .apf-field-group textarea:focus { outline: none; border-color: var(--accent-primary); }
                .apf-disabled { opacity: 0.6; cursor: not-allowed; }

                .apf-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
                .apf-tag {
                    background: rgba(59,130,246,0.1);
                    color: var(--accent-primary);
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 0.2rem 0.6rem;
                    border-radius: 99px;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                }
                .apf-tag button { background: none; border: none; color: inherit; cursor: pointer; padding: 0;font-size:1rem; line-height:1;}
                .apf-tag button:hover { color: #ef4444; }

                .apf-loading, .apf-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 4rem;
                    color: var(--text-muted);
                }
            `}</style>
        </form>
    );
}
