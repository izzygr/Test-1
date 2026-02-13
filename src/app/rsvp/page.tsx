"use client";

import { useWedding } from "@/lib/context";
import { useMemo, useState } from "react";
import {
  Mail,
  Send,
  Copy,
  CheckCircle2,
  Link as LinkIcon,
  MessageCircle,
  Users,
  UserCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { INVITATION_STATUS_LABELS } from "@/types";

export default function RSVPPage() {
  const { data, updateGuest } = useWedding();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const filteredGuests = useMemo(() => {
    if (filter === "all") return data.guests;
    return data.guests.filter((g) => g.status === filter);
  }, [data.guests, filter]);

  const stats = useMemo(() => {
    const total = data.guests.length;
    const confirmed = data.guests.filter((g) => g.status === "אישר").length;
    const declined = data.guests.filter((g) => g.status === "סירב").length;
    const invited = data.guests.filter((g) => g.status === "הוזמן").length;
    const notInvited = data.guests.filter((g) => g.status === "טרם_הוזמן").length;
    return { total, confirmed, declined, invited, notInvited };
  }, [data.guests]);

  const copyLink = (rsvpLink: string) => {
    const url = `${baseUrl}/rsvp/respond?id=${rsvpLink}`;
    navigator.clipboard.writeText(url);
    setCopiedId(rsvpLink);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareWhatsApp = (guest: typeof data.guests[0]) => {
    const url = `${baseUrl}/rsvp/respond?id=${guest.rsvpLink}`;
    const message = encodeURIComponent(
      `בס"ד\n\nלכבוד משפחת ${guest.lastName} שליט"א\n\n` +
      `בשמחה רבה הננו מזמינים אתכם לשמוח אתנו בשמחת הנישואין של\n` +
      `החתן ${data.groomName || "___"} נ"י\nעם הכלה ${data.brideName || "___"} תחי'\n\n` +
      (data.venue ? `מקום: ${data.venue}\n` : "") +
      (data.weddingDate ? `תאריך: ${new Date(data.weddingDate).toLocaleDateString("he-IL")}\n\n` : "\n") +
      `לאישור הגעה:\n${url}\n\n` +
      `בברכת מזל טוב!\n` +
      `משפחות ${data.groomFamily || "___"} ו${data.brideFamily || "___"}`
    );
    const phone = guest.phone.replace(/[^0-9]/g, "");
    const intlPhone = phone.startsWith("0") ? "972" + phone.slice(1) : phone;
    window.open(`https://wa.me/${intlPhone}?text=${message}`, "_blank");
  };

  const markAllAsInvited = () => {
    data.guests
      .filter((g) => g.status === "טרם_הוזמן")
      .forEach((g) => updateGuest(g.id, { status: "הוזמן" }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 font-hebrew flex items-center gap-3">
            <Mail className="w-8 h-8 text-gold-500" />
            הזמנות דיגיטליות - RSVP
          </h1>
          <p className="text-gray-500 mt-1">שליחת הזמנות ומעקב אישורי הגעה</p>
        </div>
        {stats.notInvited > 0 && (
          <button className="btn-gold flex items-center gap-2" onClick={markAllAsInvited}>
            <Send className="w-4 h-4" />
            סמן הכל כ&quot;הוזמנו&quot; ({stats.notInvited})
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "סה\"כ", value: stats.total, icon: Users, color: "bg-gray-100 text-gray-700" },
          { label: "טרם הוזמנו", value: stats.notInvited, icon: Clock, color: "bg-gray-100 text-gray-600" },
          { label: "הוזמנו", value: stats.invited, icon: Send, color: "bg-blue-100 text-blue-700" },
          { label: "אישרו", value: stats.confirmed, icon: UserCheck, color: "bg-green-100 text-green-700" },
          { label: "סירבו", value: stats.declined, icon: XCircle, color: "bg-red-100 text-red-700" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`card flex items-center gap-3 ${stat.color} !bg-opacity-50`}>
              <Icon className="w-8 h-8 opacity-70" />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "הכל" },
            { key: "טרם_הוזמן", label: "טרם הוזמנו" },
            { key: "הוזמן", label: "הוזמנו" },
            { key: "אישר", label: "אישרו" },
            { key: "סירב", label: "סירבו" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-gold-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guest List */}
      <div className="space-y-3">
        {filteredGuests.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>אין אורחים להצגה</p>
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <div key={guest.id} className="card flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-navy-700">
                    {guest.firstName} {guest.lastName}
                  </h3>
                  <span className={`badge ${
                    guest.status === "אישר" ? "badge-confirmed" :
                    guest.status === "סירב" ? "badge-declined" :
                    guest.status === "הוזמן" ? "badge-invited" : "badge-pending"
                  }`}>
                    {INVITATION_STATUS_LABELS[guest.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500" dir="ltr">{guest.phone}</p>
                {guest.rsvpResponse && (
                  <p className="text-xs text-green-600 mt-1">
                    אישר {guest.rsvpResponse.count} אורחים
                    {guest.rsvpResponse.childrenCount > 0 && ` + ${guest.rsvpResponse.childrenCount} ילדים`}
                    {guest.rsvpResponse.dietaryNotes && ` | ${guest.rsvpResponse.dietaryNotes}`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyLink(guest.rsvpLink || "")}
                  className="btn-outline py-2 px-3 flex items-center gap-1.5 text-sm"
                  title="העתק קישור"
                >
                  {copiedId === guest.rsvpLink ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                  {copiedId === guest.rsvpLink ? "הועתק!" : "קישור"}
                </button>

                {guest.phone && (
                  <button
                    onClick={() => shareWhatsApp(guest)}
                    className="bg-green-500 text-white py-2 px-3 rounded-xl flex items-center gap-1.5 text-sm hover:bg-green-600 transition-colors shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                )}

                <select
                  className="select-field text-sm py-2 w-auto"
                  value={guest.status}
                  onChange={(e) => updateGuest(guest.id, { status: e.target.value as typeof guest.status })}
                >
                  {Object.entries(INVITATION_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
