// Bold Statement — Strong visual hierarchy, accent background bars
#import "../shared/lib.typ": *

#let data = if sys.inputs.at("dataPath", default: none) != none {
  json(sys.inputs.dataPath)
} else {
  json("data.json")
}
#let styles = data.at("styles", default: (:))
#let accent = rgb(styles.at("accentColor", default: "#7C3AED"))
#let font = styles.at("font", default: "Inter")
#let fsize = float(styles.at("fontSize", default: 11)) * 1pt
#let lspacing = float(styles.at("lineSpacing", default: 1.15)) * 0.55em
#let mx = float(styles.at("marginLeft", default: 0.6)) * 1in
#let my = float(styles.at("marginTop", default: 0.5)) * 1in
#let sections = data.at("sectionOrder", default: ("summary", "experience", "skills", "projects", "education"))
#let vis = data.at("sectionVisibility", default: (:))
#let profile = data.at("profile", default: (:))

#show: resume-doc.with(
  author: profile.at("name", default: ""),
  accent-color: accent,
  font-family: font,
  font-size: fsize,
  line-spacing: lspacing,
  margin-x: mx,
  margin-y: my,
)

// ─── Header ─────────────────────────────────────────────────────────────────
#let show-img = data.at("showProfileImage", default: false)
#let show-qr = data.at("showQrCode", default: false)

#block(fill: accent, inset: (x: 16pt, y: 14pt), radius: 4pt, width: 100%)[
#grid(
  columns: (if show-img { 70pt } else { 0pt }, 1fr, if show-qr { 60pt } else { 0pt }),
  column-gutter: 1.5em,
  if show-img {
    profile-image-block(data.at("profileImagePath", default: ""), size: 60pt)
  } else { none },
  align(left + horizon)[
    #let name = profile.at("name", default: none)
    #text(size: 24pt, weight: "bold", fill: white)[#(if name != none and name != "" { name } else { "Your Name" })]
    #let headline = profile.at("headline", default: none)
    #if headline != none and headline != "" {
      linebreak()
      text(size: 11pt, fill: white.darken(15%))[#headline]
    }
    #v(0.3em)
    #set text(fill: white.darken(20%), size: 9pt)
    #let items = ()
    #let email = profile.at("email", default: none)
    #if email != none and email != "" { items.push(email) }
    #let phone = profile.at("phone", default: none)
    #if phone != none and phone != "" { items.push(phone) }
    #let loc = profile.at("location", default: none)
    #if loc != none and loc != "" { items.push(loc) }
    #let web = profile.at("website", default: none)
    #if web != none and web != "" { items.push(web) }
    #let li = profile.at("linkedin", default: none)
    #if li != none and li != "" { items.push("linkedin.com/in/" + str(li).split("/").at(-1)) }
    #let gh = profile.at("github", default: none)
    #if gh != none and gh != "" { items.push("github.com/" + str(gh).split("/").at(-1)) }
    #items.join([ #sym.bar.v ])
  ],
  if show-qr {
    qr-code-block(data.at("qrImagePath", default: ""), size: 45pt)
  } else { none }
)
]

#v(0.5em)

// ─── Sections ───────────────────────────────────────────────────────────────
#for section in sections {
  let show-section = vis.at(section, default: true)
  if show-section == false { continue }

  if section == "summary" {
    let summary = profile.at("summary", default: none)
    if summary != none and summary != "" {
      section-heading("Summary", accent: accent, style: "bold")
      text(size: 9.5pt, fill: luma(40))[#summary]
    }
  }

  if section == "experience" {
    let exps = profile.at("experiences", default: ())
    if exps.len() > 0 {
      section-heading("Experience", accent: accent, style: "bold")
      for exp in exps {
        entry-header(
          exp.at("title", default: ""),
          exp.at("company", default: "") + if exp.at("location", default: "") != "" { " | " + exp.location } else { "" },
          format-date-range(exp.at("startDate", default: ""), exp.at("endDate", default: none), current: exp.at("current", default: false)),
          accent: accent,
        )
        if exp.at("bullets", default: ()).len() > 0 { bullet-list(exp.bullets) }
        else if exp.at("description", default: "") != "" { text(size: 9.5pt)[#exp.description] }
        v(0.3em)
      }
    }
  }

  if section == "education" {
    let edu = profile.at("education", default: ())
    if edu.len() > 0 {
      section-heading("Education", accent: accent, style: "bold")
      for e in edu {
        entry-header(
          e.at("degree", default: "") + if e.at("field", default: "") != "" { " in " + e.field } else { "" },
          e.at("institution", default: ""),
          format-date-range(e.at("startDate", default: ""), e.at("endDate", default: none)),
        )
        v(0.2em)
      }
    }
  }

  if section == "skills" {
    let skills = profile.at("skills", default: ())
    if skills.len() > 0 {
      section-heading("Skills", accent: accent, style: "bold")
      skill-pills(skills, accent: accent)
      v(0.2em)
    }
  }

  if section == "projects" {
    let projs = profile.at("projects", default: ())
    if projs.len() > 0 {
      section-heading("Projects", accent: accent, style: "bold")
      for p in projs {
        entry-header(
          p.at("name", default: ""),
          if p.at("techStack", default: ()).len() > 0 { p.techStack.join(", ") } else { none },
          if p.at("url", default: "") != "" { p.url } else { "" }
        )
        if p.at("description", default: "") != "" { text(size: 9.5pt)[#p.description] }
        if p.at("bullets", default: ()).len() > 0 { bullet-list(p.bullets) }
        v(0.2em)
      }
    }
  }

  if section == "certifications" {
    let certs = profile.at("certifications", default: ())
    if certs.len() > 0 {
      section-heading("Certifications", accent: accent, style: "bold")
      for c in certs {
        text(weight: "semibold", size: 9.5pt)[#c.at("name", default: "")]
        text(size: 9pt, fill: luma(80))[ — #c.at("issuer", default: "")]
        linebreak()
      }
    }
  }
}
