// Compact — Two-column layout, sidebar for skills/edu, main for experience
#import "../shared/lib.typ": *

#let data = if sys.inputs.at("dataPath", default: none) != none {
  json(sys.inputs.dataPath)
} else {
  json("data.json")
}
#let styles = data.at("styles", default: (:))
#let accent = rgb(styles.at("accentColor", default: "#7C3AED"))
#let font = styles.at("font", default: "Inter")
#let fsize = float(styles.at("fontSize", default: 10)) * 1pt
#let lspacing = float(styles.at("lineSpacing", default: 1.0)) * 0.5em
#let mx = float(styles.at("marginLeft", default: 0.5)) * 1in
#let my = float(styles.at("marginTop", default: 0.4)) * 1in
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
// Absolute QR Code
#let has-qr = data.at("showQrCode", default: false)
#if has-qr {
  place(
    top + right,
    qr-code-block(data.at("qrImagePath", default: ""), size: 36pt)
  )
}

#block(fill: accent.lighten(90%), inset: (x: 12pt, y: 10pt), radius: 4pt, width: 100%)[
#let has-img = data.at("profileImagePath", default: "") != ""
#grid(
  columns: (if has-img { 60pt } else { 0pt }, 1fr),
  column-gutter: 1.2em,
  profile-image-block(data.at("profileImagePath", default: ""), size: 50pt),
  align(left + horizon)[
    #text(size: 20pt, weight: "bold", fill: accent.darken(30%))[#profile.at("name", default: "Your Name")]
    #if profile.at("headline", default: "") != "" {
      linebreak()
      text(size: 10pt, fill: luma(60))[#profile.headline]
    }
    #v(0.2em)
    #contact-row(
      email: profile.at("email", default: none),
      phone: profile.at("phone", default: none),
      location: profile.at("location", default: none),
      website: profile.at("website", default: none),
      linkedin: profile.at("linkedin", default: none),
      github: profile.at("github", default: none),
    )
  ]
)
]

#v(0.4em)

// ─── Two Column Layout ──────────────────────────────────────────────────────
#grid(
  columns: (32%, 1fr),
  column-gutter: 16pt,

  // ─── LEFT SIDEBAR ─────────────────
  [
    // Skills
    #let skills = profile.at("skills", default: ())
    #if skills.len() > 0 and vis.at("skills", default: true) != false {
      section-heading("Skills", accent: accent, style: "modern")
      for skill in skills {
        text(size: 8.5pt)[#sym.bullet #skill.at("name", default: "")]
        linebreak()
      }
    }

    // Education
    #let edu = profile.at("education", default: ())
    #if edu.len() > 0 and vis.at("education", default: true) != false {
      section-heading("Education", accent: accent, style: "modern")
      for e in edu {
        text(weight: "semibold", size: 9pt)[#e.at("degree", default: "")]
        linebreak()
        text(size: 8.5pt, fill: luma(80))[#e.at("institution", default: "")]
        linebreak()
        text(size: 8pt, fill: luma(120))[#format-date-range(e.at("startDate", default: ""), e.at("endDate", default: none))]
        v(0.3em)
      }
    }

    // Certifications
    #let certs = profile.at("certifications", default: ())
    #if certs.len() > 0 and vis.at("certifications", default: true) != false {
      section-heading("Certifications", accent: accent, style: "modern")
      for c in certs {
        text(size: 8.5pt, weight: "semibold")[#c.at("name", default: "")]
        linebreak()
        text(size: 8pt, fill: luma(100))[#c.at("issuer", default: "")]
        v(0.2em)
      }
    }
  ],

  // ─── RIGHT MAIN CONTENT ───────────
  [
    // Summary
    #let summary = profile.at("summary", default: none)
    #if summary != none and summary != "" and vis.at("summary", default: true) != false {
      section-heading("Summary", accent: accent, style: "modern")
      text(size: 9pt, fill: luma(40))[#summary]
    }

    // Experience
    #let exps = profile.at("experiences", default: ())
    #if exps.len() > 0 and vis.at("experience", default: true) != false {
      section-heading("Experience", accent: accent, style: "modern")
      for exp in exps {
        entry-header(
          exp.at("title", default: ""),
          exp.at("company", default: ""),
          format-date-range(exp.at("startDate", default: ""), exp.at("endDate", default: none), current: exp.at("current", default: false)),
          accent: accent,
        )
        if exp.at("bullets", default: ()).len() > 0 { bullet-list(exp.bullets) }
        else if exp.at("description", default: "") != "" { text(size: 9pt)[#exp.description] }
        v(0.25em)
      }
    }

    // Projects
    #let projs = profile.at("projects", default: ())
    #if projs.len() > 0 and vis.at("projects", default: true) != false {
      section-heading("Projects", accent: accent, style: "modern")
      for p in projs {
        entry-header(
          p.at("name", default: ""),
          if p.at("techStack", default: ()).len() > 0 { p.techStack.join(", ") } else { none },
          if p.at("url", default: "") != "" { p.url } else { "" },
          accent: accent
        )
        if p.at("description", default: "") != "" { text(size: 9pt)[#p.description] }
        if p.at("bullets", default: ()).len() > 0 { bullet-list(p.bullets) }
        v(0.25em)
      }
    }
  ],
)
