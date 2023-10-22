# ConflictChecker

附加依赖检测器，mod可以使用这个addon来声明自己对其他mod的依赖顺序。  
可以声明哪些mod必须存在且必须在自己之前或之后加载。同时可以声明哪些mod可以不存在，但如果存在则必须在自己之前或之后加载。

additional dependence checker. mod can use this addon to declare the dependence order of other mods.
can declare which mods must exist and must be loaded before or after self.
can also declare which mods can not exist, but if existed, must be loaded before or after self.

版本判定的详细逻辑请参见ModLoader中的 [InfiniteSemVer](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader/blob/master/src/BeforeSC2/SemVer/InfiniteSemVer.ts) 算法实现
the detail logic of version judgement please see [InfiniteSemVer](https://github.com/Lyoko-Jeremie/sugarcube-2-ModLoader/blob/master/src/BeforeSC2/SemVer/InfiniteSemVer.ts)


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
        // 以下是必须依赖列表，如果mod在必须依赖列表中，则必须在当前mod之前或之后加载
        // follow is must list. if mod in must list, they must exist and be loaded before or after current mod.
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
        // 以下是可选依赖列表，如果mod在可选依赖列表中，则必须在当前mod之前或之后加载
        // follow is optional list. if mod in optional list, they must be loaded before or after current mod if they exist.
        "optionalBefore": [
          // 以下mod可以不存在，但如果以下mod存在，则必须要在当前mod之后加载，（当前mod必须在以下mod之前加载）
          // follow mod can be not exist, but if follow mod exist, they must be loaded after current mod. (`this` mod must load before follow mod)
        ],
        "optionalAfter": [
          // 以下mod可以不存在，但如果以下mod存在，则必须要在当前mod之前加载，（当前mod必须在以下mod之后加载）
          // follow mod can be not exist, but if follow mod exist, they must be loaded before current mod. (`this` mod must load after follow mod)
        ],
        // 以下是黑名单依赖列表，如果mod在黑名单依赖中，则不能在当前mod之前或之后加载
        // 建议黑名单依赖列表指定精细的版本号范围，以避免不必要的冲突。例如 ">=1.2.3 && <1.3.0"
        // follow is black list. if mod in black list, they can not be loaded before or after current mod.
        // suggest black list declare a precise version range to avoid unnecessary conflict. for example: ">=1.2.3 && <1.3.0"
        "blackBefore": [
          // 以下mod因为某些原因不能在当前mod之后加载，（当前mod不能在以下mod之前加载）
          // follow mod can not be loaded after current mod. (`this` mod can not load before follow mod)
        ],
        "blackAfter": [
          // 以下mod因为某些原因不能在当前mod之前加载，（当前mod不能在以下mod之后加载）
          // follow mod can not be loaded before current mod. (`this` mod can not load after follow mod)
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

---

#### 初级使用
* 如果你依赖某些mod，但是需要这些mod在你之前或之后加载，请使用 `mustBefore` 和 `mustAfter`。
* 如果你不依赖（可选依赖）某些mod，但是如果这些mod存在，则需要这些mod在你之前或之后加载，请使用 `optionalBefore` 和 `optionalAfter`。
* 如果你不希望某些版本的mod在你之前或之后加载，请使用 `blackBefore` 和 `blackAfter`。
* 如果你需要在其他mod加载之后汉化、翻译其他mod，请使用 `optionalAfter` 来声明你的mod需要在其他被翻译的mod之后加载。
* 如果你需要给其他mod打补丁，请使用 `mustAfter` 或 `optionalAfter` 来声明你的mod需要在其他mod之后加载。
* 如果你需要在其他mod加载时修改其他mod，例如直接通过修改其他mod的zip数据来翻译这些mod或给这些mod打补丁，请使用 `mustBefore` 或 `optionalBefore` 来声明你的mod需要在其他mod之前加载。

#### 中级使用
* 如果某些mod的部分版本因为一些原因（bug或feature）和你的mod有冲突，你需要在这些mod加载后针对性地给这些mod打补丁或者检测这些mod的存在，但在其他情况下这些mod和你没关系，这时你可以使用 `blackBefore` 来指定你不能在这些mod之前加载。


#### 高级使用（非常复杂情况下的解决方案）
TODO
