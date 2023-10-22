# ConflictChecker

附加依赖检测器，mod可以使用这个addon来声明自己对其他mod的依赖顺序。  
可以声明哪些mod必须存在且必须在自己之前或之后加载。同时可以声明哪些mod可以不存在，但如果存在则必须在自己之前或之后加载。

additional dependence checker. mod can use this addon to declare the dependence order of other mods.
can declare which mods must exist and must be loaded before or after self.
can also declare which mods can not exist, but if existed, must be loaded before or after self.


---

`ConflictChecker` : `ConflictCheckerAddon`

```json lines
{
  "addonPlugin": [
    {
      "modName": "ConflictChecker",
      "addonName": "ConflictCheckerAddon",
      "modVersion": "^1.0.0",
      "params": {
        "mustBefore": [
          // 以下mod必须在当前mod之后加载，（当前mod必须在以下mod之前加载）
          // follow mod must be loaded after current mod. (`this` mod must load before follow mods)
        ],
        "mustAfter": [
          // 以下mod必须在当前mod之前加载，（当前mod必须在以下mod之后加载）
          // follow mod must be loaded before current mod. (`this` mod must load after follow mods)
          {
            "modName": "ConflictChecker",
            "version": "^1.0.0"
          }
        ],
        "optionalBefore": [
          // 以下mod可以不存在，但如果以下mod存在，则必须要在当前mod之后加载，（当前mod必须在以下mod之前加载）
          // follow mod can be not exist, but if follow mod exist, they must be loaded after current mod. (`this` mod must load before follow mod)
        ],
        "optionalAfter": [
          // 以下mod可以不存在，但如果以下mod存在，则必须要在当前mod之前加载，（当前mod必须在以下mod之后加载）
          // follow mod can be not exist, but if follow mod exist, they must be loaded before current mod. (`this` mod must load after follow mod)
        ],
      }
    }
  ],
  "dependenceInfo": [
    {
      "modName": "ConflictChecker",
      "version": "^1.0.0"
    }
  ]
}
```



```

[(mustAfter) & (optionalAfter)] -> (now mod) -> [(mustBefore) & (optionalBefore)]

```
