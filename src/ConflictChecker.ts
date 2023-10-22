import type {AddonPluginHookPointEx} from "../../../dist-BeforeSC2/AddonPlugin";
import type {LifeTimeCircleHook, LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {ModBootJsonAddonPlugin, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import type {ModZipReader} from "../../../dist-BeforeSC2/ModZipReader";
import type {InfiniteSemVerApi} from "../../../dist-BeforeSC2/DependenceChecker";
import {checkParams, ConflictCheckerParams, ModLimit} from "./ConflictCheckerParams";

export class ConflictChecker implements LifeTimeCircleHook, AddonPluginHookPointEx {
    logger: LogWrapper;
    infiniteSemVerApi: InfiniteSemVerApi;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.logger = gModUtils.getLogger();
        this.infiniteSemVerApi = this.gSC2DataManager.getDependenceChecker().getInfiniteSemVerApi();
        this.gSC2DataManager.getModLoadController().addLifeTimeCircleHook('ConflictChecker', this);
        this.gModUtils.getAddonPluginManager().registerAddonPlugin(
            'ConflictChecker',
            'ConflictCheckerAddon',
            this,
        );
    }

    modList: Map<string, ConflictCheckerParams> = new Map<string, ConflictCheckerParams>();

    async registerMod(addonName: string, mod: ModInfo, modZip: ModZipReader) {
        if (!mod) {
            console.error('registerMod() (!mod)', [addonName, mod]);
            this.logger.error(`registerMod() (!mod): addon[${addonName}] mod[${mod}]`);
            return;
        }
        const pp = mod.bootJson.addonPlugin?.find((T: ModBootJsonAddonPlugin) => {
            return T.modName === 'ConflictChecker'
                && T.addonName === 'ConflictCheckerAddon';
        })?.params;
        if (!checkParams(pp)) {
            console.error('[ConflictChecker] registerMod() ParamsInvalid', [addonName, mod, pp]);
            this.logger.error(`[ConflictChecker] registerMod() ParamsInvalid: addon[${addonName}]`);
            return;
        }
        if (this.modList.has(mod.name)) {
            console.error('[ConflictChecker] registerMod() modNameConflict', [addonName, mod.name, mod, pp]);
            this.logger.error(`[ConflictChecker] registerMod() modNameConflict: mod[${mod.name}]`);
            return;
        }
        this.modList.set(mod.name, pp);
    }

    async ModLoaderLoadEnd() {
        // check limit
        const parseRange = this.infiniteSemVerApi.parseRange;
        const parseVersion = this.infiniteSemVerApi.parseVersion;
        const satisfies = this.infiniteSemVerApi.satisfies;
        const modOrder = this.gSC2DataManager.getModLoader().modOrder;

        const getAndCheck = (mName: string, ccp: ConflictCheckerParams, ml: ModLimit, k: keyof ConflictCheckerParams, optional = false) => {
            const m2I = modOrder.indexOf(ml.modName);
            const mi = this.gSC2DataManager.getModLoader().getMod(ml.modName);
            if (m2I < 0 || !mi) {
                if (optional) {
                    console.log(`[ConflictChecker] ModLoaderLoadEnd() {${k}} not found mod`, [mName, ml, ccp]);
                    this.logger.log(`[ConflictChecker] ModLoaderLoadEnd() {${k}} not found mod[${ml.modName}] mod[${mName}]`);
                    return true;
                }
                console.error(`[ConflictChecker] ModLoaderLoadEnd() {${k}} not found mod`, [mName, ml, ccp]);
                this.logger.error(`[ConflictChecker] ModLoaderLoadEnd() {${k}} not found mod[${ml.modName}] mod[${mName}]`);
                return false;
            }
            if (satisfies(parseVersion(mi.version).version, parseRange(ml.version))) {
                console.error(`[ConflictChecker] ModLoaderLoadEnd() {${k}} not satisfies`, [mName, ml, ccp, mi]);
                this.logger.error(`[ConflictChecker] ModLoaderLoadEnd() {${k}} not satisfies: mod[${mName}] need mod[${mi.name}] version[${ml.version}] but find version[${mi.version}].`);
                return false;
            }
            return true;
        }

        for (const [mName, ccp] of this.modList) {
            const m1I = modOrder.indexOf(mName);
            if (m1I < 0) {
                // never go there
                console.error('[ConflictChecker] ModLoaderLoadEnd() not found mod. never go there!!!', [mName, ccp]);
                this.logger.error(`[ConflictChecker] ModLoaderLoadEnd() not found mod[${mName}]. never go there.`);
                continue;
            }
            for (const ml of ccp.mustBefore || []) {
                if (!getAndCheck(mName, ccp, ml, 'mustBefore')) {
                    continue;
                }
                const m2I = modOrder.indexOf(ml.modName);
                if (!(m2I > m1I)) {
                    console.error('[ConflictChecker] ModLoaderLoadEnd() mustBefore not satisfies order', [mName, ml, ccp, m2I, m1I]);
                    this.logger.error(`[ConflictChecker] ModLoaderLoadEnd() mustBefore not satisfies order: mod[${mName}] need mod[${ml.modName}] load before it.`);
                }
            }
            for (const ml of ccp.mustAfter || []) {
                if (!getAndCheck(mName, ccp, ml, 'mustAfter')) {
                    continue;
                }
                const m2I = modOrder.indexOf(ml.modName);
                if (!(m2I < m1I)) {
                    console.error('[ConflictChecker] ModLoaderLoadEnd() mustAfter not satisfies order', [mName, ml, ccp, m2I, m1I]);
                    this.logger.error(`[ConflictChecker] ModLoaderLoadEnd() mustAfter not satisfies order: mod[${mName}] need mod[${ml.modName}] load before it.`);
                }
            }
            for (const ml of ccp.optionalBefore || []) {
                if (!getAndCheck(mName, ccp, ml, 'optionalBefore')) {
                    continue;
                }
                const m2I = modOrder.indexOf(ml.modName);
                if (!(m2I > m1I)) {
                    console.error('[ConflictChecker] ModLoaderLoadEnd() optionalBefore not satisfies order', [mName, ml, ccp, m2I, m1I]);
                    this.logger.error(`[ConflictChecker] ModLoaderLoadEnd() optionalBefore not satisfies order: mod[${mName}] need mod[${ml.modName}] load before it.`);
                }
            }
            for (const ml of ccp.optionalAfter || []) {
                if (!getAndCheck(mName, ccp, ml, 'optionalAfter')) {
                    continue;
                }
                const m2I = modOrder.indexOf(ml.modName);
                if (!(m2I < m1I)) {
                    console.error('[ConflictChecker] ModLoaderLoadEnd() optionalAfter not satisfies order', [mName, ml, ccp, m2I, m1I]);
                    this.logger.error(`[ConflictChecker] ModLoaderLoadEnd() optionalAfter not satisfies order: mod[${mName}] need mod[${ml.modName}] load before it.`);
                }
            }
        }
    }

}