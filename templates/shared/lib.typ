// Typst shared styling and helpers for Scribe.ai templates
// All templates import this file for consistent styling primitives.

// ─── Brand Colors ───────────────────────────────────────────────────────────

#let scribe-rose = rgb("#FF3366")
#let scribe-violet = rgb("#7C3AED")
#let scribe-cyan = rgb("#06B6D4")

// ─── Helper: Section Heading ────────────────────────────────────────────────

#let section-heading(title, accent: scribe-violet, style: "modern") = {
  if style == "modern" {
    v(0.6em)
    text(size: 11pt, weight: "bold", fill: accent, tracking: 0.05em)[#upper(title)]
    v(0.2em)
    line(length: 100%, stroke: 0.5pt + accent.lighten(60%))
    v(0.3em)
  } else if style == "classic" {
    v(0.6em)
    text(size: 12pt, weight: "bold", fill: luma(30))[#title]
    v(0.15em)
    line(length: 100%, stroke: 0.8pt + luma(180))
    v(0.3em)
  } else if style == "minimal" {
    v(0.5em)
    text(size: 10pt, weight: "semibold", fill: luma(60), tracking: 0.08em)[#upper(title)]
    v(0.15em)
    line(length: 100%, stroke: 0.3pt + luma(200))
    v(0.25em)
  } else if style == "bold" {
    v(0.6em)
    block(fill: accent, inset: (x: 8pt, y: 4pt), radius: 2pt)[
      #text(size: 10pt, weight: "bold", fill: white, tracking: 0.06em)[#upper(title)]
    ]
    v(0.3em)
  } else {
    v(0.5em)
    text(size: 11pt, weight: "bold", fill: luma(30))[#title]
    v(0.2em)
    line(length: 100%, stroke: 0.5pt + luma(200))
    v(0.3em)
  }
}

// ─── Helper: Entry Header (for Experience, Education) ───────────────────────

#let entry-header(title, subtitle, date-range, accent: scribe-violet, bold-title: true) = {
  grid(
    columns: (1fr, auto),
    align: (left, right),
    [
      #if bold-title {
        text(weight: "bold", size: 10.5pt)[#title]
      } else {
        text(weight: "semibold", size: 10.5pt)[#title]
      }
      #if subtitle != none and subtitle != "" {
        linebreak()
        text(size: 9.5pt, fill: luma(80), style: "italic")[#subtitle]
      }
    ],
    text(size: 9pt, fill: luma(100))[#date-range],
  )
}

// ─── Helper: Bullet List ────────────────────────────────────────────────────

#let bullet-list(items) = {
  for item in items {
    if item != none and item != "" {
      block(spacing: 0.35em)[
        #text(fill: luma(80), size: 9pt)[#sym.bullet.op ]
        #text(size: 9.5pt)[#item]
      ]
    }
  }
}

// ─── Helper: Contact Row ────────────────────────────────────────────────────

#let contact-row(email: none, phone: none, location: none, website: none, linkedin: none, github: none) = {
  let items = ()
  if email != none and email != "" { items.push(email) }
  if phone != none and phone != "" { items.push(phone) }
  if location != none and location != "" { items.push(location) }
  if website != none and website != "" { items.push(website) }
  if linkedin != none and linkedin != "" { items.push(linkedin) }
  if github != none and github != "" { items.push(github) }

  text(size: 9pt, fill: luma(80))[
    #items.join([ #sym.bar.v ])
  ]
}

// ─── Helper: Skill Pills ───────────────────────────────────────────────────

#let skill-pills(skills, accent: scribe-violet) = {
  let pill(name) = {
    box(
      inset: (x: 6pt, y: 3pt),
      radius: 10pt,
      fill: accent.lighten(85%),
      stroke: 0.5pt + accent.lighten(60%),
    )[#text(size: 8.5pt, fill: accent.darken(20%))[#name]]
  }
  for skill in skills {
    pill(skill.name)
    h(4pt)
  }
}

// ─── Helper: Skill List (plain) ─────────────────────────────────────────────

#let skill-list(skills) = {
  // Group by category
  let categories = (:)
  for skill in skills {
    let cat = if skill.category != none { skill.category } else { "Other" }
    if cat not in categories {
      categories.insert(cat, ())
    }
    categories.at(cat).push(skill.name)
  }
  for (cat, names) in categories {
    text(weight: "semibold", size: 9.5pt)[#cat: ]
    text(size: 9.5pt)[#names.join(", ")]
    linebreak()
  }
}

// ─── Helper: Format Date ────────────────────────────────────────────────────

#let format-date-range(start, end, current: false) = {
  let s = if start != none and start != "" { start } else { "" }
  let e = if current { "Present" } else if end != none and end != "" { end } else { "" }
  if s != "" and e != "" { s + " - " + e }
  else if s != "" { s }
  else { e }
}

// ─── Main Document Setup ────────────────────────────────────────────────────

#let resume-doc(
  author: "",
  job-title: "",
  accent-color: scribe-violet,
  font-family: "Inter",
  font-size: 10pt,
  line-spacing: 0.65em,
  margin-x: 1.5cm,
  margin-y: 1.5cm,
  body
) = {
  set document(author: author, title: author + " - Resume")
  set page(
    margin: (x: margin-x, y: margin-y),
    paper: "us-letter",
  )
  set text(
    font: font-family,
    size: font-size,
    fill: luma(20),
  )
  set par(leading: line-spacing)

  body
}
