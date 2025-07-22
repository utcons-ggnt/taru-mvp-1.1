import React from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';

export default function RewardsTab({ badges }: { badges: Array<{ name: string; description: string; icon: string }> }) {
  // Helper to get student name (from localStorage or prompt)
  const getStudentName = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          return parsed.name || 'Student';
        } catch {
          return 'Student';
        }
      }
    }
    return 'Student';
  };

  const handleDownloadCertificate = (badge: { name: string; description: string }) => {
    const doc = new jsPDF();
    const studentName = getStudentName();
    const date = new Date().toLocaleDateString();
    doc.setFontSize(22);
    doc.text('Certificate of Achievement', 105, 30, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`This certifies that`, 105, 50, { align: 'center' });
    doc.setFontSize(20);
    doc.text(studentName, 105, 65, { align: 'center' });
    doc.setFontSize(16);
    doc.text('has earned the badge:', 105, 80, { align: 'center' });
    doc.setFontSize(18);
    doc.text(badge.name, 105, 95, { align: 'center' });
    doc.setFontSize(14);
    doc.text(String(badge.description || 'Achievement badge'), 105, 110, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 140);
    doc.text('Congratulations!', 105, 160, { align: 'center' });
    doc.save(`${studentName.replace(/\s+/g, '_')}_${badge.name.replace(/\s+/g, '_')}_certificate.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-purple-700">My Rewards & Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {badges.map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center bg-purple-50 rounded-lg p-4 shadow-sm">
            <Image src={badge.icon} alt={badge.name || 'Badge'} width={64} height={64} className="w-16 h-16 mb-2" />
            <div className="font-semibold text-gray-900">{badge.name}</div>
            <div className="text-xs text-gray-900 text-center mt-1">{badge.description}</div>
            <button
              className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded"
              onClick={() => handleDownloadCertificate(badge)}
            >
              Download Certificate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 