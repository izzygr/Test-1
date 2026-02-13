"use client";

import { useWedding } from "@/lib/context";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Heart, CheckCircle2, Send, Star } from "lucide-react";

export default function RSVPResponsePage() {
  const { data, updateGuest } = useWedding();
  const params = useParams();
  const rsvpId = params.id as string;

  const guest = useMemo(
    () => data.guests.find((g) => g.rsvpLink === rsvpId),
    [data.guests, rsvpId]
  );

  const [attending, setAttending] = useState(true);
  const [count, setCount] = useState(guest?.numberOfGuests || 2);
  const [childrenCount, setChildrenCount] = useState(guest?.numberOfChildren || 0);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
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
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-700 font-hebrew mb-2">
            תודה רבה!
          </h1>
          <p className="text-gray-500 text-lg">
            {attending ? "שמחים שתגיעו לשמוח אתנו!" : "תודה על העדכון. נשמח לראותכם באירועים הבאים בע\"ה."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-gold-600">
            <Star className="w-5 h-5" />
            <span className="font-hebrew">בברכת מזל טוב</span>
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    updateGuest(guest.id, {
      status: attending ? "אישר" : "סירב",
      numberOfGuests: attending ? count : 0,
      numberOfChildren: attending ? childrenCount : 0,
      rsvpResponse: {
        attending,
        count: attending ? count : 0,
        childrenCount: attending ? childrenCount : 0,
        dietaryNotes,
        respondedAt: new Date().toISOString(),
      },
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-gold-500" />
            <Heart className="w-8 h-8 text-red-400 fill-red-400" />
            <Star className="w-6 h-6 text-gold-500" />
          </div>
          <h1 className="text-3xl font-bold font-hebrew bg-gradient-to-l from-gold-600 to-gold-700 bg-clip-text text-transparent">
            שמחת נישואין
          </h1>
          <div className="ornament-divider">
            <span className="text-gold-500 font-hebrew text-lg">
              {data.groomName || "החתן"} & {data.brideName || "הכלה"}
            </span>
          </div>
          {data.weddingDate && (
            <p className="text-gray-500">
              {new Date(data.weddingDate).toLocaleDateString("he-IL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {data.venue && <p className="text-gray-400 text-sm mt-1">{data.venue}</p>}
        </div>

        <div className="ornament-divider">
          <span className="text-sm text-gold-600">
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
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    מספר מבוגרים
                  </label>
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
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    מספר ילדים
                  </label>
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
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  הערות (אלרגיות, דיאטה...)
                </label>
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
            className="btn-gold w-full py-4 text-lg flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            שליחת אישור
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ✡ בסימן טוב ומזל טוב ✡
        </p>
      </div>
    </div>
  );
}
