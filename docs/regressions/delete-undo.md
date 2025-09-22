# Delete → Undo Regression Check

This manual regression check ensures removing an object and undoing the action restores the scene to its prior state without duplicating entries.

1. Start the development server with `npm run dev` and open the Clay Studio in the browser.
2. Create a second clay object ("Add object" button) so that deleting is permitted.
3. Select the object you plan to remove and note the total object count in the sidebar list.
4. Delete the selection using the toolbar trash icon or the `Delete` keyboard shortcut.
   - The object list should shrink by one entry.
5. Trigger undo (toolbar undo button or `Ctrl/Cmd + Z`).
   - The deleted object should return exactly once to the list in its original position.
   - The previously selected object ID should become selected again.
6. Confirm the object count matches the value from step 3 and no duplicate entries exist.

Document the result in QA notes if any deviation is observed.
