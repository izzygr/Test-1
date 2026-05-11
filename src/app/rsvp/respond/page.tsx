"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";
import { CheckCircle2, Send, Sparkles, Loader2, XCircle } from "lucide-react";

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  numberOfGuests: number;
  numberOfChildren: number;
  rsvpResponse?: {
    attending: boolean;
    count: number;
    childrenCount: number;
    dietaryNotes?: string;
    respondedAt: string;
  };
  wedding?: {
    groomName: string;
    brideName: string;
    groomFamily: string;
    brideFamily: string;
    venue: string;
    weddingDate: string;
  };
}

function RSVPForm() {
  const searchParams = useSearchParams();
  const rsvpId = searchParams.get("id") || "";

  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [attending, setAttending] = useState(true);
  const [count, setCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchGuest = useCallback(async () => {
    if (!rsvpId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/rsvp?id=${encodeURIComponent(rsvpId)}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data: GuestData = await res.json();
      setGuest(data);
      setCount(data.numberOfGuests || 2);
      setChildrenCount(data.numberOfChildren || 0);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [rsvpId]);

  useEffect(() => {
    fetchGuest();
  }, [fetchGuest]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (notFound || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-700 font-hebrew mb-4">
            הזמנה לא נמצאה
          </h1>
          <p className="text-gray-500">
            קישור ההזמנה אינו תקין. אנא פנו למשפחות החתן והכלה.
          </p>
        </div>
      </div>
    );
  }

  if (submitted || guest.rsvpResponse) {
    const wasAttending = submitted ? attending : guest.rsvpResponse?.attending;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-700 font-hebrew mb-2">
            תודה רבה!
          </h1>
          <p className="text-gray-500 text-lg">
            {wasAttending
              ? "שמחים שתגיעו לשמוח אתנו!"
              : "תודה על העדכון. נשמח לראותכם באירועים הבאים בע\"ה."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-gold-500">
            <Sparkles className="w-5 h-5" />
            <span className="font-hebrew">בברכת מזל טוב</span>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvpId,
          attending,
          count: attending ? count : 0,
          childrenCount: attending ? childrenCount : 0,
          dietaryNotes,
        }),
      });
      setSubmitted(true);
    } catch {
      alert("שגיאה בשליחת האישור. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  const w = guest.wedding;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gold-50 to-white">
      <div className="card max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-gold-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold font-hebrew text-navy-700">
            הזמנה לחתונה
          </h1>
          <div className="ornament-divider">
            <span className="text-gold-600 font-hebrew text-lg">
              {w?.groomName || "החתן"} & {w?.brideName || "הכלה"}
            </span>
          </div>
          {w?.weddingDate && (
            <p className="text-gray-500">
              {new Date(w.weddingDate).toLocaleDateString("he-IL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {w?.venue && <p className="text-gray-400 text-sm mt-1">{w.venue}</p>}
        </div>

        <div className="ornament-divider">
          <span className="text-sm text-gray-500">
            לכבוד משפחת {guest.lastName}
          </span>
        </div>

        {/* Form */}
        <div className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3">האם תגיעו לשמחה?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAttending(true)}
                className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                  attending
                    ? "bg-green-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                בע&quot;ה נגיע! ✓
              </button>
              <button
                onClick={() => setAttending(false)}
                className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                  !attending
                    ? "bg-red-400 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                לצערנו לא
              </button>
            </div>
          </div>

          {attending && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">מספר מבוגרים</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="input-field text-center text-xl"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">מספר ילדים</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    className="input-field text-center text-xl"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">הערות (אלרגיות, דיאטה...)</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  placeholder="הערות מיוחדות..."
                />
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-gold w-full py-4 text-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                שליחת אישור
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          בסימן טוב ומזל טוב
        </p>
      </div>
    </div>
  );
}

export default function RSVPResponsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      }
    >
      <RSVPForm />
    </Suspense>
  );
}
