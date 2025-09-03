import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

// --- Supabase client (browser) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- Small helpers ---
const fmtDate = (d) => new Date(d).toLocaleDateString();
const fallbackColors = ["Black", "Chocolate", "Cream", "Apricot", "Red", "Gold"];

export default function AppHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [units, setUnits] = useState("grams");
  const [litters, setLitters] = useState([]);
  const [colors, setColors] = useState(fallbackColors);
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState("");

  // ---------- Boot: load session, profile, litters, color_map ----------
  useEffect(() => {
    (async () => {
      const { data: userData, error: uErr } = await supabase.auth.getUser();
      if (uErr || !userData?.user) {
        // No session → bounce to sign-in if you have /signin; else stay.
        setLoading(false);
        return;
      }
      setUser(userData.user);

      // profiles
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, units")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (prof) {
        setDisplayName(prof.display_name || "");
        setUnits(prof.units || "grams");
      }

      // color_map (optional)
      const { data: cmap } = await supabase.from("color_map").select("name");
      if (Array.isArray(cmap) && cmap.length) {
        setColors(cmap.map((r) => r.name));
      }

      // litters for this user
      const { data: lits } = await supabase
        .from("litters")
        .select("id, litter_name, sire_name, dam_name, whelp_date")
        .eq("user_id", userData.user.id)
        .order("whelp_date", { ascending: false });

      setLitters(lits || []);
      setLoading(false);
    })();
  }, []);

  // ---------- Save display name ----------
  const [nameInput, setNameInput] = useState("");
  useEffect(() => setNameInput(displayName || ""), [displayName]);

  const saveName = async () => {
    if (!user) return;
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    await supabase.from("profiles").upsert(
      { id: user.id, display_name: trimmed, units },
      { onConflict: "id" }
    );
    setDisplayName(trimmed);
  };

  // ---------- Create Litter ----------
  const handleCreated = (newLitter) => {
    // Refresh list and (optionally) navigate later when /litter/[id] exists.
    setLitters((prev) => [newLitter, ...prev]);
    setShowCreate(false);
    // router.push(`/litter/${newLitter.id}`); // enable once that page exists
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <Header displayName={displayName} />

      {!displayName ? (
        <Card>
          <h3 style={{ marginTop: 0 }}>How should we address you?</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              style={{ flex: 1, padding: "10px 12px", fontSize: 16 }}
            />
            <button onClick={saveName} className="btn">
              Save
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar />
            <div>
              <div style={{ fontWeight: 600 }}>{displayName}</div>
              <div style={{ opacity: 0.7, fontSize: 14 }}>Preferences: {units}</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {/* Stub: You can replace with a real Preferences modal later */}
              <button
                className="link"
                onClick={() => setUnits((u) => (u === "grams" ? "ounces" : "grams"))}
              >
                Preferences
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 style={{ marginTop: 0 }}>Get Started</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <button className="btn primary" onClick={() => setShowCreate(true)}>
            Add a litter
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={openId}
              onChange={(e) => setOpenId(e.target.value)}
              style={{ flex: 1, padding: "10px 12px", fontSize: 16 }}
            >
              <option value="">Choose existing litter…</option>
              {litters.map((l) => (
                <option key={l.id} value={l.id}>
                  {(l.litter_name || `${l.sire_name} x ${l.dam_name}`) +
                    (l.whelp_date ? ` • ${fmtDate(l.whelp_date)}` : "")}
                </option>
              ))}
            </select>
            <button
              className="btn"
              onClick={() => {
                if (!openId) return;
                // Navigate when your Litter Home route exists.
                // For now, keep users here to avoid another 404.
                // router.push(`/litter/${openId}`);
                alert("Litter Home will open once that route is added.");
              }}
            >
              Open
            </button>
          </div>
        </div>
      </Card>

      {showCreate && (
        <CreateLitterModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
          userId={user?.id}
          colors={colors}
        />
      )}

      <Style />
    </div>
  );
}

/* ---------------- Components ---------------- */

function Header({ displayName }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
      <div
        style={{
          width: 52,
          height: 52,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Replace /logo.svg with your actual asset URL */}
        <img
          alt="Companion Dog Project"
          src="/logo.svg"
          onError={(e) => (e.currentTarget.style.display = "none")}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        <span style={{ position: "absolute", fontSize: 10, opacity: 0.2 }}>CDP</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>
        Companion Dog Project • Puppy Weight Tracker
      </div>
      <div style={{ marginLeft: "auto", fontSize: 14, opacity: 0.8 }}>
        {displayName ? `Signed in as ${displayName}` : ""}
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function Avatar() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#d1d5db",
        border: "1px solid #c7cbd1",
      }}
    />
  );
}

function CreateLitterModal({ onClose, onCreated, userId, colors }) {
  const [sire, setSire] = useState("");
  const [dam, setDam] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [addNow, setAddNow] = useState(false);

  const [rows, setRows] = useState([
    { name: "", sex: "", color: "Black", bw: "", status: "Active" },
  ]);

  const addRow = () =>
    setRows((r) => [...r, { name: "", sex: "", color: "Black", bw: "", status: "Active" }]);

  const updateRow = (i, field, val) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const canSave = sire.trim() && dam.trim() && date;

  const save = async () => {
    if (!userId || !canSave) return;

    const litter_name = name.trim() || `${sire.trim()} x ${dam.trim()}`;

    const { data: litter, error } = await supabase
      .from("litters")
      .insert({
        user_id: userId,
        sire_name: sire.trim(),
        dam_name: dam.trim(),
        litter_name,
        whelp_date: date,
        notes: notes || null,
      })
      .select("id, litter_name, sire_name, dam_name, whelp_date")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (addNow) {
      const pups = rows
        .filter((r) => r.name.trim())
        .map((r) => ({
          litter_id: litter.id,
          name: r.name.trim(),
          sex: r.sex || null,
          color: r.color || "Black",
          birth_weight_grams: r.bw ? Number(r.bw) : null,
          status: r.status || "Active",
        }));
      if (pups.length) {
        const { error: pErr } = await supabase.from("puppies").insert(pups);
        if (pErr) {
          alert(`Puppies not saved: ${pErr.message}`);
        }
      }
    }

    onCreated(litter);
  };

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h3 style={{ margin: 0, flex: 1 }}>Create Litter</h3>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="grid2">
          <Input label="Sire name *" value={sire} onChange={setSire} />
          <Input label="Dam name *" value={dam} onChange={setDam} />
          <Input label="Litter name (optional)" value={name} onChange={setName} />
          <Input label="Whelp date *" type="date" value={date} onChange={setDate} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label className="label">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="textarea"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={addNow}
              onChange={(e) => setAddNow(e.target.checked)}
            />
            Add puppies now?
          </label>
        </div>

        {addNow && (
          <div style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 24 }}></th>
                  <th>Name *</th>
                  <th>Sex (opt)</th>
                  <th>Color</th>
                  <th>Birth weight (g)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <button className="iconBtn" onClick={() => removeRow(i)} title="Remove">
                        −
                      </button>
                    </td>
                    <td>
                      <input
                        className="input"
                        value={r.name}
                        onChange={(e) => updateRow(i, "name", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="input"
                        value={r.sex}
                        onChange={(e) => updateRow(i, "sex", e.target.value)}
                      >
                        <option value="">—</option>
                        <option value="F">F</option>
                        <option value="M">M</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="input"
                        value={r.color}
                        onChange={(e) => updateRow(i, "color", e.target.value)}
                      >
                        {colors.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        value={r.bw}
                        onChange={(e) => updateRow(i, "bw", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="input"
                        value={r.status}
                        onChange={(e) => updateRow(i, "status", e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Deceased">Deceased</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn" onClick={addRow} style={{ marginTop: 6 }}>
              + Add Puppy
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={save} disabled={!canSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ---------------- Minimal styles ---------------- */
function Style() {
  return (
    <style jsx global>{`
      body { background: #f7f7f8; }
      .btn {
        padding: 10px 12px; border: 1px solid #d1d5db; background: #fff;
        border-radius: 10px; cursor: pointer; font-weight: 600;
      }
      .btn.primary { background: #111827; color: #fff; border-color: #111827; }
      .iconBtn { border: 1px solid #d1d5db; background: #fff; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; }
      .link { background: transparent; border: none; color: #2563eb; cursor: pointer; }
      .label { display: block; font-size: 13px; opacity: 0.8; margin-bottom: 4px; }
      .input, .textarea, select {
        width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 10px; background: #fff;
      }
      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .table { width: 100%; border-collapse: collapse; }
      .table th, .table td { border-top: 1px solid #eee; padding: 8px; }
      .modalBackdrop {
        position: fixed; inset: 0; background: rgba(0,0,0,0.35);
        display: grid; place-items: center; padding: 20px; z-index: 50;
      }
      .modal {
        width: 100%; max-width: 820px; background: #fff; border-radius: 16px;
        border: 1px solid #e5e7eb; padding: 16px;
      }
      @media (max-width: 720px) { .grid2 { grid-template-columns: 1fr; } }
    `}</style>
  );
}
