"""Localization utilities for Smart Irrigation integration."""

import json
import logging
from pathlib import Path

import aiofiles

from smart_irrigation.const import LANGUAGE_FILES_DIR, SUPPORTED_LANGUAGES

_LOGGER = logging.getLogger(__name__)


async def localize(string, language):
    """Localize a string based on the provided language.

    Args:
        string: The dot-separated key for the string to localize.
        language: The language code to use for localization.

    Returns:
        The localized string if found, otherwise the original string.

    """
    # try opening language file
    language = language.lower()
    translated_string = None
    main_path = Path(__file__).parent.parent
    stringpath = string.split(".")
    try:
        # if the language is not english and the language is supported
        if language != "en" and language in SUPPORTED_LANGUAGES:
            async with aiofiles.open(
                Path(main_path) / LANGUAGE_FILES_DIR / f"{language}.json"
            ) as f:
                contents = await f.read()
            data = json.loads(contents)
            translated_string = get_string_from_data(stringpath, data)
        # fallback to english in case string wasn't found
        if language == "en" or not translated_string:
            async with aiofiles.open(
                Path(main_path) / LANGUAGE_FILES_DIR / f"{language}.json"
            ) as f:
                contents = await f.read()
            data = json.loads(contents)
            translated_string = get_string_from_data(stringpath, data)
        # if still not found, just return the string parameter
        if translated_string:
            return translated_string
    except OSError:
        _LOGGER.error("Couldn't load translations language file for %s", language)
        return string
    else:
        return string


def get_string_from_data(stringpath, data):
    """Retrieve a nested string from a dictionary using a list of keys.

    Args:
        stringpath: List of keys representing the path to the desired string.
        data: The dictionary to search.

    Returns:
        The found string or the last traversed value if not a string.

    """
    data_to_walk = data
    for p in stringpath:
        if isinstance(data_to_walk, str):
            return data_to_walk
        if p in data_to_walk:
            data_to_walk = data_to_walk[p]
    return data_to_walk
