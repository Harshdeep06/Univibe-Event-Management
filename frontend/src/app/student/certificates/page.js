'use client';

import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import API from '../../../services/api';
import { Award, Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function StudentCertificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await API.get('/students/certificates');
      if (res.data.success) {
        setCerts(res.data.certificates || []);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#3D56B2');
    grad.addColorStop(1, '#5C7AEA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(20, 20, 760, 560);

    
    ctx.font = 'bold 30px Poppins, sans-serif';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF PARTICIPATION', 400, 110);

    
    ctx.font = 'normal 14px Inter, sans-serif';
    ctx.fillStyle = '#757575';
    ctx.fillText('This is to certify that student', 400, 180);

    ctx.font = 'bold 26px Poppins, sans-serif';
    ctx.fillStyle = '#3D56B2';
    ctx.fillText(user?.name || 'Gurpreet Singh', 400, 245);

    ctx.font = 'normal 14px Inter, sans-serif';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(`successfully completed the event:`, 400, 305);

    ctx.font = 'bold 16px Poppins, sans-serif';
    ctx.fillText(`"${cert.event?.name}"`, 400, 345);

    ctx.font = 'normal 12px Inter, sans-serif';
    ctx.fillStyle = '#757575';
    ctx.fillText(`organized by ${cert.club?.name || 'UNIVIBE Club'} on ${new Date(cert.event?.date).toLocaleDateString()}`, 400, 385);

    
    ctx.fillText('Faculty Coordinator Signature', 400, 480);
    ctx.beginPath();
    ctx.moveTo(300, 490);
    ctx.lineTo(500, 490);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#757575';
    ctx.stroke();

    ctx.fillText(`Verification ID: ${cert.certificateId}`, 400, 530);

    
    const link = document.createElement('a');
    link.download = `UNIVIBE-Certificate-${cert.certificateId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#3D56B2] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5">Certificates Locker</h2>
          <p className="text-xs text-[#757575] mb-6">Earn completion credentials by checking in to registered hackathons and events.</p>

          {certs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {certs.map((c) => (
                <div key={c._id} className="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="text-[#3D56B2]" size={28} />
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] dark:text-white">{c.event?.name}</h4>
                      <p className="text-[10px] text-[#757575] mt-0.5">ID: {c.certificateId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(c)}
                    className="p-2 bg-[#E0E5F5] hover:bg-[#CBD5E1] text-[#3D56B2] rounded-lg transition-colors"
                    title="Download PNG Certificate"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Award className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-xs text-[#757575] dark:text-gray-400 italic">No certificates issued yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
