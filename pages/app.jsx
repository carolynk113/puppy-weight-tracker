import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const fmtDate = (d) => new Date(d).toLocaleDateString();

export default function AppHome() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // profile
  const [displayName, setDisplayName] = useState("");
  const [programName, setProgramName] = useState("");

  // onboarding inputs (first sign-in only)
  const [nameInput, setNameInput] = useState("");
  const [programInput, setProgramInput] = useState("");

  // litters
  const [litters, setLitters] = useState([]);
  const [openId, setOpenId] = useState("");

  // color_map from Supabase
  const [collarColors, setCollarColors] = useState([]);

  // create panel
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { setLoading(false); return; }
      setUser(u.user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, program_name")
        .eq("id", u.user.id)
        .maybeSingle();

      if (prof) {
        setDisplayName(prof.display_name || "");
        setProgramName(prof.program_name || "");
        setNameInput(prof.display_name || "");
        setProgramInput(prof.program_name || "");
      }

      const { data: lits } = await supabase
        .from("litters")
        .select("id, litter_name, sire_name, dam_name, whelp_date")
        .eq("user_id", u.user.id)
        .order("whelp_date", { ascending: false });
      setLitters(lits || []);

      // pull your color_map (label column) so dropdown matches Supabase
      const { data: cmap } = await supabase.from("color_map").select("label").order("label");
      setCollarColors(cmap?.map(r => r.label) || ["Black"]); // fallback

      setLoading(false);
    })();
  }, []);

  const saveBasics = async () => {
    if (!user) return;
    const d = nameInput.trim();
    const p = programInput.trim();
    if (!d || !p) return;
    await supabase.from("profiles").upsert(
      { id: user.id, display_name: d, program_name: p },
      { onConflict: "id" }
    );
    setDisplayName(d);
    setProgramName(p);
  };

  if (loading) return <div className="card">Loading…</div>;
  const firstSignIn = !displayName || !programName;

  return (
    <div>
      {/* Greeting / Onboarding */}
      {!firstSignIn ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>
            You’re signed in. Welcome, {displayName} — {programName}.
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: "6px 0 10px" }}>Tell us who you are</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label className="label">Your name</label>
              <input className="input" value={nameInput} onChange={(e)=>setNameInput(e.target.value)} />
            </div>
            <div>
              <label className="label">Breeding program</label>
              <input className="input" value={programInput} onChange={(e)=>setProgramInput(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <button className="btn" onClick={saveBasics} disabled={!nameInput.trim() || !programInput.trim()}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Primary actions */}
      <div className="card">
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:12, alignItems:"center" }}>
          <button className="btn" onClick={() => setShowCreate(true)}>Add a litter</button>

          <select className="input" value={openId} onChange={(e)=>setOpenId(e.target.value)}>
            {litters.length === 0 ? (
              <option value="">No litters yet</option>
            ) : (
              <>
                <option value="">Choose existing litter…</option>
                {litters.map((l) => (
                  <option key={l.id} value={l.id}>
                    {(l.litter_name || `${l.sire_name} x ${l.dam_name}`) +
                      (l.whelp_date ? ` • ${fmtDate(l.whelp_date)}` : "")}
                  </option>
                ))}
              </>
            )}
          </select>

          <button className="btn ghost" disabled={!openId}
            onClick={() => { if (!openId) return; alert("Litter Home will open once that route is added."); }}>
            Open
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateLitterPanel
          onClose={() => setShowCreate(false)}
          onCreated={(lit) => { setLitters((p)=>[lit, ...p]); setShowCreate(false); }}
          userId={user?.id}
          collarColors={collarColors}
        />
      )}
    </div>
  );
}

/* ---------- Create Litter (Collar color from Supabase; unit picker; no Deceased) ---------- */
function CreateLitterPanel({ onClose, onCreated, userId, collarColors }) {
  const [sire, setSire] = useState("");
  const [dam, setDam] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [addNow, setAddNow] = useState(false);

  // unit for birth weights
  const [unit, setUnit] = useState("grams"); // grams | ounces | kilograms | lb-oz

  // rows
  const blank = { name:"", sex:"", collar: (collarColors[0] || "Black"), bw:"", lb:"", oz:"" };
  const [rows, setRows] = useState([ { ...blank } ]);

  useEffect(() => {
    // if colors arrive after open, reset default for the first row
    setRows((r)=> r.length ? r : [{ ...blank }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collarColors]);

  const addRow = () => setRows((r) => [...r, { ...blank }]);
  const updateRow = (i, k, v) => setRows((r) => r.map((row, idx) => (idx===i ? { ...row, [k]: v } : row)));
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx!==i));

  const canSave = sire.trim() && dam.trim() && date;

  // conversions (always store grams)
  const ozToG  = (oz) => Math.round(Number(oz||0) * 28.349523125);
  const kgToG  = (kg) => Math.round(Number(kg||0) * 1000);
  const lbOzToG = (lb,oz) => Math.round(((Number(lb||0)*16) + Number(oz||0)) * 28.349523125);
  const rowToGrams = (row) => {
    if (unit==="grams")     return row.bw ? Math.round(Number(row.bw)) : null;
    if (unit==="ounces")    return row.bw ? ozToG(row.bw) : null;
    if (unit==="kilograms") return row.bw ? kgToG(row.bw) : null;
    if (unit==="lb-oz")     return (row.lb || row.oz) ? lbOzToG(row.lb, row.oz) : null;
    return null;
  };

  const save = async () => {
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

    if (error) { alert(error.message); return; }

    if (addNow) {
      const pups = rows
        .filter(r => r.name.trim())
        .map(r => ({
          litter_id: litter.id,
          name: r.name.trim(),
          sex: r.sex || null,
          color: r.collar || "Black", // stored as color; UI label is "Collar color"
          birth_weight_grams: rowToGrams(r),
          status: "Active",
        }));
      if (pups.length){
        const { error: pErr } = await supabase.from("puppies").insert(pups);
        if (pErr) alert(`Puppies not saved: ${pErr.message}`);
      }
    }

    onCreated(litter);
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e)=>e.stopPropagation()}>
        <div className="row" style={{ justifyContent:"space-between" }}>
          <h3 style={{ margin:0 }}>Create Litter</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>

        {/* Litter fields */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:8 }}>
          <Field label="Sire name *"  value={sire} onChange={setSire} />
          <Field label="Dam name *"   value={dam} onChange={setDam} />
          <Field label="Litter name (optional)" value={name} onChange={setName} />
          <Field label="Whelp date *" type="date" value={date} onChange={setDate} />
        </div>

        <div style={{ marginTop:8 }}>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
        </div>

        {/* Add puppies toggle */}
        <div style={{ marginTop:12 }}>
          <label style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" checked={addNow} onChange={(e)=>setAddNow(e.target.checked)} />
            Add puppies now?
          </label>
        </div>

        {/* Puppies block */}
        {addNow && (
          <div style={{ marginTop:12 }}>
            {/* Unit chooser */}
            <div className="row" style={{ marginBottom:8 }}>
              <label className="label" style={{ margin:0 }}>Birth-weight unit</label>
              <select className="input" style={{ maxWidth:240 }} value={unit} onChange={(e)=>setUnit(e.target.value)}>
                <option value="grams">grams</option>
                <option value="ounces">ounces</option>
                <option value="kilograms">kilograms</option>
                <option value="lb-oz">pounds + ounces</option>
              </select>
            </div>

            {/* Table with horizontal scroll so nothing overlaps */}
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", minWidth:820 }}>
                <thead>
                  <tr>
                    <TH style={{ width:36 }} />
                    <TH>Name *</TH>
                    <TH>Sex</TH>
                    <TH>Collar color</TH>
                    <TH>Birth weight ({unit === "lb-oz" ? "lb + oz" : unit})</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderTop:"1px solid var(--line)" }}>
                      <TD>
                        <button className="btn ghost" onClick={()=>removeRow(i)} title="Remove" style={{ padding:"6px 10px" }}>−</button>
                      </TD>
                      <TD>
                        <input className="input" value={r.name} onChange={(e)=>updateRow(i,"name",e.target.value)} />
                      </TD>
                      <TD>
                        <select className="input" value={r.sex} onChange={(e)=>updateRow(i,"sex",e.target.value)}>
                          <option value="">—</option>
                          <option value="F">F</option>
                          <option value="M">M</option>
                        </select>
                      </TD>
                      <TD>
                        <select className="input" value={r.collar} onChange={(e)=>updateRow(i,"collar",e.target.value)}>
                          {(collarColors.length ? collarColors : ["Black"]).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </TD>
                      <TD>
                        {unit === "lb-oz" ? (
                          <div className="row">
                            <input className="input" type="number" min="0" step="1" value={r.lb} onChange={(e)=>updateRow(i,"lb",e.target.value)} placeholder="lb" style={{ maxWidth:100 }} />
                            <input className="input" type="number" min="0" step="0.1" value={r.oz} onChange={(e)=>updateRow(i,"oz",e.target.value)} placeholder="oz" style={{ maxWidth:120 }} />
                          </div>
                        ) : (
                          <input
                            className="input"
                            type="number"
                            min="0"
                            step={unit==="ounces" ? "0.1" : unit==="kilograms" ? "0.001" : "1"}
                            value={r.bw}
                            onChange={(e)=>updateRow(i,"bw",e.target.value)}
                          />
                        )}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="btn ghost" onClick={addRow} style={{ marginTop:8 }}>+ Add Puppy</button>
          </div>
        )}

        <div className="row" style={{ gap:8, marginTop:16 }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={save} disabled={!canSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* small helpers for table cells */
function TH({ children, style }) { return <th style={{ padding:"8px 6px", ...style }}>{children}</th>; }
function TD({ children, style }) { return <td style={{ padding:"8px 6px", verticalAlign:"middle", ...style }}>{children}</td>; }
function Field({ label, type="text", value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} value={value} onChange={(e)=>onChange(e.target.value)} />
    </div>
  );
}
