#shared-lib
// Typst shared styling and helpers for Scribe.ai templates

#let scribe-red = rgb("#FF3366")
#let scribe-violet = rgb("#7C3AED")
#let scribe-cyan = rgb("#06B6D4")

// A basic layout function that all templates will use
#let resume-doc(
  author: "",
  job-title: "",
  accent-color: scribe-violet,
  font-family: "Inter",
  body
) = {
  set document(author: author, title: author + " - Resume")
  set page(
    margin: (x: 1.5cm, y: 1.5cm),
    paper: "us-letter",
  )
  
  set text(
    font: font-family,
    size: 10pt,
    fill: luma(20),
  )

  // Header
  align(center)[
    #text(size: 24pt, weight: "bold", fill: accent-color)[#author] \
    #v(0.5em)
    #text(size: 12pt, fill: luma(100))[#job-title]
  ]

  // Body content
  body
}
