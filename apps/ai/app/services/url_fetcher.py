"""
URL Fetcher — Fetch job descriptions from URLs and extract text.
"""
import httpx
from bs4 import BeautifulSoup
from loguru import logger
from typing import Optional


async def fetch_jd_from_url(url: str) -> dict:
    """
    Fetch a URL and extract the main text content.
    Returns extracted text and metadata.
    """
    logger.info(f"Fetching JD from URL: {url}")

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml",
            })
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching URL: {e.response.status_code}")
        return {"error": f"HTTP error: {e.response.status_code}", "text": None}
    except httpx.RequestError as e:
        logger.error(f"Request error fetching URL: {e}")
        return {"error": f"Could not fetch URL: {str(e)}", "text": None}

    html = response.text
    soup = BeautifulSoup(html, "html.parser")

    # Remove script, style, nav, footer elements
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
        tag.decompose()

    # Try to find the main content area
    main_content = _extract_main_content(soup)

    # Get page title
    title = soup.title.string if soup.title else None

    return {
        "text": main_content,
        "title": title,
        "url": str(response.url),
        "error": None,
    }


def _extract_main_content(soup: BeautifulSoup) -> str:
    """Extract the main text content from parsed HTML."""
    # Try common job posting containers
    selectors = [
        'article',
        '[class*="job-description"]',
        '[class*="jobDescription"]',
        '[class*="job_description"]',
        '[class*="description"]',
        '[id*="job-description"]',
        '[id*="description"]',
        'main',
        '[role="main"]',
    ]

    for selector in selectors:
        element = soup.select_one(selector)
        if element:
            text = element.get_text(separator="\n", strip=True)
            if len(text) > 200:
                return _clean_text(text)

    # Fallback: get all text from body
    body = soup.body
    if body:
        text = body.get_text(separator="\n", strip=True)
        return _clean_text(text)

    return soup.get_text(separator="\n", strip=True)


def _clean_text(text: str) -> str:
    """Clean extracted text."""
    import re
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    # Remove very short lines (likely navigation)
    lines = text.split('\n')
    filtered = [l for l in lines if len(l.strip()) > 3 or l.strip() == '']
    return '\n'.join(filtered).strip()
