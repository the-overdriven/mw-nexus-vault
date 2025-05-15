# mw-nexus-vault
Preserving the metadata of TES III: Morrowind mods on NexusMods.com, grouped by author.

If nexusmods.com ever goes down, a modder is banned or deletes their account/mods, it's important to preserve at least the knowledge of the mods they created.

It also archives file ids of all mods updated after 2025-01-01.

I've came up with this because web.archive.org (and human memory) is unfortunately too slow and unreliable.

## Usage

pull mods of all authors (that exist as .json file in `./mods/*`): 
```
node fetch-mods.js
```

pull mods of one author (doesn't have to exist in `./mods/*`):
```
node fetch-mods.js vurt
```

Console output:  

![image](https://github.com/user-attachments/assets/d08d20ad-63b7-4a95-91e9-f5b282c82b0b)
