---
title: "Uninstalling"
---
# Uninstalling

!!! warning "Export a backup first"

    Deleting the integration removes its zones, sensor groups, programs and settings. Adding it again starts from nothing, with the setup assistant. If you may want them back, export a backup first under **Settings › Backup / restore** in the Smart Irrigation panel.

1. In **Settings › Devices & services**, open **Smart Irrigation**, then choose **Delete** in the three-dot menu.
2. Remove the files:
   - **Installed from the Marketplace**: on Smart Irrigation's page in **Settings › Marketplace**, choose **Uninstall** in the three-dot menu (in HACS, before Home Assistant 2026.11: **Remove**).
   - **Installed by hand**: delete the `custom_components/smart_irrigation` folder.
3. Restart Home Assistant.
