// Minimalist — Ultra-clean, no color accents, maximum readability
#import "../shared/lib.typ": *

#let data = if sys.inputs.at("dataPath", default: none) != none {
  json(sys.inputs.dataPath)
} else {
  json("data.json")
}
#let styles = data.at("styles", default: (:))
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
  accent-color: luma(60),
  font-family: font,
  font-size: fsize,
  line-spacing: lspacing,
  margin-x: mx,
  margin-y: my,
)

// ─── Header ─────────────────────────────────────────────────────────────────
#let show-img = data.at("showProfileImage", default: false)
#let show-qr = data.at("showQrCode", default: false)
#grid(
  columns: (if show-img { 65pt } else { 0pt }, 1fr, if show-qr { 50pt } else { 0pt }),
  column-gutter: 1.5em,
  align: (left + horizon, left + horizon, right + horizon),
  if show-img {
    profile-image-block(data.at("profileImagePath", default: ""), size: 60pt)
  } else { none },
  [
    #let name = profile.at("name", default: none)
    #text(size: 26pt, weight: "light", tracking: 0.02em)[#(if name != none and name != "" { name } else { "Your Name" })]
    #v(0.15em)
    #let headline = profile.at("headline", default: none)
    #if headline != none and headline != "" {
      text(size: 10pt, fill: luma(100))[#headline]
      v(0.15em)
    }
    #contact-row(
      email: profile.at("email", default: none),
      phone: profile.at("phone", default: none),
      location: profile.at("location", default: none),
      website: profile.at("website", default: none),
      linkedin: profile.at("linkedin", default: none),
      github: profile.at("github", default: none),
    )
  ],
  if show-qr {
    qr-code-block(data.at("qrImagePath", default: ""), size: 40pt)
  } else { none }
)
#v(0.5em)

// ─── Sections ───────────────────────────────────────────────────────────────
#for section in sections {
  let show-section = vis.at(section, default: true)
  if show-section == false { continue }

  if section == "summary" {
    let summary = profile.at("summary", default: none)
    if summary != none and summary != "" {
      section-heading("Summary", style: "minimal")
      text(size: 9.5pt, fill: luma(40))[#summary]
    }
  }

  if section == "experience" {
    let exps = profile.at("experiences", default: ())
    if exps.len() > 0 {
      section-heading("Experience", style: "minimal")
      for exp in exps {
        entry-header(
          exp.at("title", default: ""),
          exp.at("company", default: "") + if exp.at("location", default: "") != "" { ", " + exp.location } else { "" },
          format-date-range(exp.at("startDate", default: ""), exp.at("endDate", default: none), current: exp.at("current", default: false)),
        )
        if exp.at("bullets", default: ()).len() > 0 { bullet-list(exp.bullets) }
        else if exp.at("description", default: "") != "" { text(size: 9.5pt)[#exp.description] }
        v(0.25em)
      }
    }
  }

  if section == "education" {
    let edu = profile.at("education", default: ())
    if edu.len() > 0 {
      section-heading("Education", style: "minimal")
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
      section-heading("Skills", style: "minimal")
      skill-list(skills)
    }
  }

  if section == "projects" {
    let projs = profile.at("projects", default: ())
    if projs.len() > 0 {
      section-heading("Projects", style: "minimal")
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
      section-heading("Certifications", style: "minimal")
      for c in certs {
        text(size: 9.5pt)[#c.at("name", default: "") — #c.at("issuer", default: "")]
        linebreak()
      }
    }
  }
}
