// Modern Clean — Single-column, accent-colored dividers, pill-style skills
#import "../shared/lib.typ": *

#let data = if sys.inputs.at("data", default: none) != none {
  json.decode(sys.inputs.data)
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
#align(center)[
  #text(size: 22pt, weight: "bold", fill: accent)[#profile.at("name", default: "Your Name")]
  #v(0.3em)
  #if profile.at("headline", default: "") != "" {
    text(size: 11pt, fill: luma(80))[#profile.headline]
    v(0.2em)
  }
  #contact-row(
    email: profile.at("email", default: none),
    phone: profile.at("phone", default: none),
    location: profile.at("location", default: none),
    website: profile.at("website", default: none),
    linkedin: profile.at("linkedin", default: none),
    github: profile.at("github", default: none),
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
      section-heading("Summary", accent: accent, style: "modern")
      text(size: 9.5pt, fill: luma(40))[#summary]
    }
  }

  if section == "experience" {
    let exps = profile.at("experiences", default: ())
    if exps.len() > 0 {
      section-heading("Experience", accent: accent, style: "modern")
      for exp in exps {
        entry-header(
          exp.at("title", default: ""),
          exp.at("company", default: "") + if exp.at("location", default: "") != "" { ", " + exp.location } else { "" },
          format-date-range(exp.at("startDate", default: ""), exp.at("endDate", default: none), current: exp.at("current", default: false)),
          accent: accent,
        )
        if exp.at("bullets", default: ()).len() > 0 {
          bullet-list(exp.bullets)
        } else if exp.at("description", default: "") != "" {
          text(size: 9.5pt)[#exp.description]
        }
        v(0.3em)
      }
    }
  }

  if section == "education" {
    let edu = profile.at("education", default: ())
    if edu.len() > 0 {
      section-heading("Education", accent: accent, style: "modern")
      for e in edu {
        entry-header(
          e.at("degree", default: "") + if e.at("field", default: "") != "" { " in " + e.field } else { "" },
          e.at("institution", default: ""),
          format-date-range(e.at("startDate", default: ""), e.at("endDate", default: none)),
          accent: accent,
        )
        if e.at("gpa", default: "") != "" {
          text(size: 9pt, fill: luma(80))[GPA: #e.gpa]
        }
        v(0.2em)
      }
    }
  }

  if section == "skills" {
    let skills = profile.at("skills", default: ())
    if skills.len() > 0 {
      section-heading("Skills", accent: accent, style: "modern")
      skill-pills(skills, accent: accent)
      v(0.2em)
    }
  }

  if section == "projects" {
    let projs = profile.at("projects", default: ())
    if projs.len() > 0 {
      section-heading("Projects", accent: accent, style: "modern")
      for p in projs {
        entry-header(
          p.at("name", default: ""),
          if p.at("techStack", default: ()).len() > 0 { p.techStack.join(", ") } else { none },
          "",
          accent: accent,
        )
        if p.at("description", default: "") != "" {
          text(size: 9.5pt)[#p.description]
        }
        if p.at("bullets", default: ()).len() > 0 {
          bullet-list(p.bullets)
        }
        v(0.2em)
      }
    }
  }

  if section == "certifications" {
    let certs = profile.at("certifications", default: ())
    if certs.len() > 0 {
      section-heading("Certifications", accent: accent, style: "modern")
      for c in certs {
        text(weight: "semibold", size: 9.5pt)[#c.at("name", default: "")]
        text(size: 9pt, fill: luma(80))[ — #c.at("issuer", default: "")]
        linebreak()
      }
    }
  }
}
