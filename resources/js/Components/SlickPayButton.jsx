import { useState } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

/**
 * Bouton de paiement Slick-Pay.
 * Redirige directement vers SATIM sans page intermédiaire.
 */
export function SlickPayButton({ applicationId, amount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`/api/evisa/pay/${applicationId}`);
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('URL de paiement non reçue.');
      }
    } catch (e) {
      setError(e.response?.data?.error || "Impossible d'initier le paiement. Merci de réessayer.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handlePay} disabled={loading}
        className="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-br from-[#00143C] to-[#0F2D5C] hover:shadow-[0_8px_32px_rgba(0,20,60,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3">
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Redirection vers SATIM...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payer {amount ? `${Number(amount).toLocaleString('fr-DZ')} DZD` : ''}
          </>
        )}
      </button>

      {/* Badges de paiement - Le badge Slick-Pay a été retiré */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        <Badge icon="🔒" text="Paiement sécurisé SATIM" />
        <Badge icon="🏦" text="CIB & EDAHABIA" />
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">{error}</div>
      )}
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-[#8892A4] text-xs">
      <span>{icon}</span><span>{text}</span>
    </div>
  );
}

/**
 * SuccessStep mis à jour — Intègre le choix de méthode (En ligne ou En agence)
 */
export function SuccessStep({ reference, applicationId, amount, nbTravelers = 1 }) {
  const [payAtAgency, setPayAtAgency] = useState(false);

  // Écran d'accueil de remerciement si l'utilisateur choisit de payer en agence
  if (payAtAgency) {
    return (
      <div className="max-w-[520px] mx-auto text-center py-10 px-4">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-[#C9A84C]/10 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] text-3xl">💼</div>
        </div>

        <h2 className="mb-2 text-[#00143C]">Demande enregistrée !</h2>
        <p className="text-[#8892A4] mb-6 text-sm">
          Votre choix de paiement en agence a bien été pris en compte pour le dossier <strong className="text-[#00143C]">{reference}</strong>.
        </p>

        {/* Détails des étapes suivantes en agence */}
        <div className="bg-white rounded-2xl border border-[#EDE9E0] p-6 mb-8 text-left shadow-[var(--shadow-soft)]">
          <h4 className="font-semibold text-[#00143C] mb-4 flex items-center gap-2 text-sm">
            <span className="text-[#C9A84C]">📅</span>
            Comment finaliser votre dossier ?
          </h4>
          <ul className="space-y-4 text-sm text-[#8892A4]">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Un conseiller d'Aelia Travel va vous appeler ou vous envoyer un e-mail sous <strong>24 heures</strong> pour valider vos documents.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>Nous planifierons ensemble votre rendez-vous de dépôt et de règlement.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>Vous pourrez régler directement au niveau de notre agence (en espèces ou par chèque).</span>
            </li>
          </ul>
        </div>

        <Link href="/" className="inline-block text-sm text-[#8892A4] hover:text-[#00143C] transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Écran par défaut (Choix de paiement en ligne avec option alternative d'agence)
  return (
    <div className="max-w-[520px] mx-auto text-center py-10 px-4">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-[#0F6E56]/10 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-[#0F6E56]/15 flex items-center justify-center text-[#0F6E56] text-3xl">✓</div>
      </div>

      <h2 className="mb-2">Demande reçue !</h2>
      <p className="text-[#8892A4] mb-4 text-sm">
        Votre dossier pour <strong>{nbTravelers} voyageur{nbTravelers > 1 ? 's' : ''}</strong> a bien été enregistré.
      </p>

      {/* Référence dossier */}
      <div className="inline-block px-8 py-3 rounded-2xl bg-[#00143C] text-[#C9A84C] text-xl font-semibold mb-6 mono tracking-wider shadow-[0_8px_32px_rgba(0,20,60,0.2)]">
        {reference}
      </div>

      <div className="my-5 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#EDE9E0]" />
        <span className="text-[#8892A4] text-xs font-semibold uppercase tracking-wider">Options de règlement</span>
        <div className="flex-1 h-px bg-[#EDE9E0]" />
      </div>

      {/* Bloc paiement & Actions */}
      <div className="bg-white rounded-2xl border border-[#EDE9E0] p-6 mb-6 text-left shadow-[var(--shadow-soft)]">
        <h4 className="font-semibold text-[#00143C] mb-1 flex items-center gap-2 text-sm">
          <span className="text-[#C9A84C]">💳</span>
          Option 1 : Paiement en ligne immédiat
        </h4>
        {nbTravelers > 1 && (
          <p className="text-[#8892A4] text-xs mb-3">
            {nbTravelers} voyageurs — montant total : <strong className="text-[#00143C]">{Number(amount).toLocaleString('fr-DZ')} DZD</strong>
          </p>
        )}
        <p className="text-[#8892A4] text-sm mb-4">
          Réglez de manière sécurisée par carte CIB ou EDAHABIA.
        </p>
        
        {/* Bouton de paiement SATIM */}
        <SlickPayButton applicationId={applicationId} amount={amount} />

        <div className="my-5 h-px bg-[#EDE9E0]" />

        <h4 className="font-semibold text-[#00143C] mb-1 flex items-center gap-2 text-sm">
          <span className="text-[#0F6E56]">💼</span>
          Option 2 : Paiement en agence
        </h4>
        <p className="text-[#8892A4] text-sm mb-4">
          Enregistrez votre dossier et venez finaliser votre règlement directement dans nos locaux.
        </p>

        {/* Nouveau bouton de redirection interne pour l'agence */}
        <button
          type="button"
          onClick={() => setPayAtAgency(true)}
          className="w-full py-3.5 rounded-full font-semibold text-[#00143C] bg-[#F7F5F0] border border-[#EDE9E0] hover:bg-[#EDE9E0] transition-all duration-300 text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Choisir le paiement en agence
        </button>
      </div>

      <Link href="/" className="inline-block text-sm text-[#8892A4] hover:text-[#00143C] transition-colors">
        ← Retour à l'accueil
      </Link>
    </div>
  );
}