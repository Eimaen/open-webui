<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { createEventDispatcher, onMount, getContext } from 'svelte';
	import { config, user } from '$lib/stores';
	import {
		updateTranslationEngineUrl,
		getTranslationEngineUrl,

		updateTranslationConfig,

		getTranslationConfig


	} from '$lib/apis/translations';
	import { getBackendConfig } from '$lib/apis';
	const dispatch = createEventDispatcher();

	const i18n = getContext('i18n');

	export let saveSettings: Function;

	let loading = false;

	let translationEngine = '';
	let enableTranslations = false;
	let sourceLanguage = '';
	let targetLanguage = 'EN';
	let promptSourceLanguage = '';
	let promptTargetLanguage = 'EN';
	let autoTranslate = false;
	let autoTranslatePrompt = false;

	let DEEPLX_BASE_URL = '';

	const updateUrlHandler = async () => {
		if (translationEngine === '') {
			const res = await updateTranslationEngineUrl(localStorage.token, {
				DEEPLX_BASE_URL
			}).catch((error) => {
				toast.error(error);

				console.log(error);
				return null;
			});

			if (res) {
				DEEPLX_BASE_URL = res.DEEPLX_BASE_URL;

				toast.success($i18n.t('Server connection verified'));
			} else {
				({ DEEPLX_BASE_URL } = await getTranslationEngineUrl(localStorage.token));
			}
		}
	};

	const updateTranslation = async () => {
		const res = await updateTranslationConfig(
			localStorage.token,
			translationEngine,
			enableTranslations
		).catch((error) => {
			toast.error(error);
			return null;
		});

		if (res) {
			translationEngine = res.engine;
			enableTranslations = res.enabled;
		} else {
			const config = await getTranslationConfig(localStorage.token);
			translationEngine = config.translationEngine ?? '';
			enableTranslations = config.enableTranslations ?? false;
		}
	};

	onMount(async () => {
		let settings = JSON.parse(localStorage.getItem('settings') ?? '{}');

		sourceLanguage = settings.translation.sourceLanguage ?? '';
		targetLanguage = settings.translation.targetLanguage ?? 'EN';
		promptSourceLanguage = settings.translation.promptSourceLanguage ?? '';
		promptTargetLanguage = settings.translation.promptTargetLanguage ?? 'EN';
		autoTranslate = settings.translation.autoTranslate ?? false;
		autoTranslatePrompt = settings.translation.autoTranslatePrompt ?? false;

		DEEPLX_BASE_URL = (await getTranslationEngineUrl(localStorage.token)).DEEPLX_BASE_URL ?? '';
		const config = await getTranslationConfig(localStorage.token);

		translationEngine = config.translationEngine ?? '';
		enableTranslations = config.enableTranslations ?? false;
	});
</script>

<form
	class="flex flex-col h-full justify-between space-y-3 text-sm"
	on:submit|preventDefault={async () => {
		loading = true;

		if (translationEngine === '') {
			await updateTranslationEngineUrl(localStorage.token, { DEEPLX_BASE_URL });
		}

		await updateTranslationConfig(localStorage.token, translationEngine, enableTranslations);

		saveSettings({
			translation: {
				autoTranslate,
				autoTranslatePrompt,
				sourceLanguage: sourceLanguage !== '' ? sourceLanguage : undefined,
				targetLanguage: targetLanguage !== '' ? targetLanguage : undefined,
				promptSourceLanguage: promptSourceLanguage !== '' ? promptSourceLanguage : undefined,
				promptTargetLanguage: promptTargetLanguage !== '' ? promptTargetLanguage : undefined
			}
		})

		dispatch('save');
		loading = false;
	}}
>
	<div class=" space-y-3 pr-1.5 overflow-y-scroll max-h-[24rem]">
		<div>
			<div class=" mb-1 text-sm font-medium">{$i18n.t('Translation Settings')}</div>

			<div class=" py-0.5 flex w-full justify-between">
				<div class=" self-center text-xs font-medium">{$i18n.t('Translation Engine')}</div>
				<div class="flex items-center relative">
					<select
						class="w-fit pr-8 rounded px-2 p-1 text-xs bg-transparent outline-none text-right"
						bind:value={translationEngine}
						placeholder={$i18n.t('Translation Engine')}
						on:change={async () => {
							await updateTranslation();
						}}
					>
						<option value="">{$i18n.t('Default (DeepLX)')}</option>
					</select>
				</div>
			</div>

			<div class=" py-0.5 flex w-full justify-between">
				<div class=" self-center text-xs font-medium">{$i18n.t('Response Source Language')}</div>
				<div class="flex items-center relative">
					<select
						class="w-fit pr-8 rounded px-2 p-1 text-xs bg-transparent outline-none text-right"
						bind:value={sourceLanguage}
						placeholder={$i18n.t('Source Language')}
					>
						<option value="">{$i18n.t('Auto')}</option>
						<option value="EN">{$i18n.t('English')}</option>
					</select>
				</div>
			</div>

			<div class=" py-0.5 flex w-full justify-between">
				<div class=" self-center text-xs font-medium">{$i18n.t('Response Target Language')}</div>
				<div class="flex items-center relative">
					<select
						class="w-fit pr-8 rounded px-2 p-1 text-xs bg-transparent outline-none text-right"
						bind:value={targetLanguage}
						placeholder={$i18n.t('Target Language')}
					>
						<option value="EN">{$i18n.t('English')}</option>
						<option value="RU">{$i18n.t('Russian')}</option>
					</select>
				</div>
			</div>

			<div>
				<div class=" py-0.5 flex w-full justify-between">
					<div class=" self-center text-xs font-medium">
						{$i18n.t('Auto-translate Responses')}
					</div>

					<button
						class="p-1 px-3 text-xs flex rounded transition"
						on:click={() => {
							autoTranslate = !autoTranslate;
						}}
						type="button"
					>
						{#if autoTranslate === true}
							<span class="ml-2 self-center">{$i18n.t('On')}</span>
						{:else}
							<span class="ml-2 self-center">{$i18n.t('Off')}</span>
						{/if}
					</button>
				</div>
			</div>

			<div class=" py-0.5 flex w-full justify-between">
				<div class=" self-center text-xs font-medium">{$i18n.t('Prompt Source Language')}</div>
				<div class="flex items-center relative">
					<select
						class="w-fit pr-8 rounded px-2 p-1 text-xs bg-transparent outline-none text-right"
						bind:value={promptSourceLanguage}
						placeholder={$i18n.t('Source Language')}
					>
						<option value="">{$i18n.t('Auto')}</option>
						<option value="EN">{$i18n.t('English')}</option>
					</select>
				</div>
			</div>

			<div class=" py-0.5 flex w-full justify-between">
				<div class=" self-center text-xs font-medium">{$i18n.t('Prompt Target Language')}</div>
				<div class="flex items-center relative">
					<select
						class="w-fit pr-8 rounded px-2 p-1 text-xs bg-transparent outline-none text-right"
						bind:value={promptTargetLanguage}
						placeholder={$i18n.t('Target Language')}
					>
						<option value="EN">{$i18n.t('English')}</option>
						<option value="RU">{$i18n.t('Russian')}</option>
					</select>
				</div>
			</div>

			<div>
				<div class=" py-0.5 flex w-full justify-between">
					<div class=" self-center text-xs font-medium">
						{$i18n.t('Auto-translate Prompts')}
					</div>

					<button
						class="p-1 px-3 text-xs flex rounded transition"
						on:click={() => {
							autoTranslatePrompt = !autoTranslatePrompt;
						}}
						type="button"
					>
						{#if autoTranslatePrompt === true}
							<span class="ml-2 self-center">{$i18n.t('On')}</span>
						{:else}
							<span class="ml-2 self-center">{$i18n.t('Off')}</span>
						{/if}
					</button>
				</div>
			</div>

			<div>
				<div class=" py-0.5 flex w-full justify-between">
					<div class=" self-center text-xs font-medium">
						{$i18n.t('Translation (Experimental)')}
					</div>

					<button
						class="p-1 px-3 text-xs flex rounded transition"
						on:click={() => {
							if (translationEngine === '' && DEEPLX_BASE_URL === '') {
								toast.error($i18n.t('DeepLX Base URL is required.'));
								enableTranslations = false;
							} else {
								enableTranslations = !enableTranslations;
							}

							updateTranslation();
						}}
						type="button"
					>
						{#if enableTranslations === true}
							<span class="ml-2 self-center">{$i18n.t('On')}</span>
						{:else}
							<span class="ml-2 self-center">{$i18n.t('Off')}</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
		<hr class=" dark:border-gray-700" />

		{#if translationEngine === ''}
			<div class=" mb-2.5 text-sm font-medium">{$i18n.t('DeepLX Base URL')}</div>
			<div class="flex w-full">
				<div class="flex-1 mr-2">
					<input
						class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none"
						placeholder={$i18n.t('Enter URL (e.g. http://127.0.0.1:7860/)')}
						bind:value={DEEPLX_BASE_URL}
					/>
				</div>
				<button
					class="px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-100 rounded-lg transition"
					type="button"
					on:click={() => {
						updateUrlHandler();
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							fill-rule="evenodd"
							d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>

			<div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
				{$i18n.t('Include `--api` flag when running stable-diffusion-webui')}
				<a
					class=" text-gray-300 font-medium"
					href="https://github.com/AUTOMATIC1111/stable-diffusion-webui/discussions/3734"
					target="_blank"
				>
					{$i18n.t('(e.g. `sh webui.sh --api`)')}
				</a>
			</div>
		{/if}
	</div>

	<div class="flex justify-end pt-3 text-sm font-medium">
		<button
			class=" px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-gray-100 transition rounded-lg flex flex-row space-x-1 items-center {loading
				? ' cursor-not-allowed'
				: ''}"
			type="submit"
			disabled={loading}
		>
			{$i18n.t('Save')}

			{#if loading}
				<div class="ml-2 self-center">
					<svg
						class=" w-4 h-4"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						><style>
							.spinner_ajPY {
								transform-origin: center;
								animation: spinner_AtaB 0.75s infinite linear;
							}
							@keyframes spinner_AtaB {
								100% {
									transform: rotate(360deg);
								}
							}
						</style><path
							d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
							opacity=".25"
						/><path
							d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
							class="spinner_ajPY"
						/></svg
					>
				</div>
			{/if}
		</button>
	</div>
</form>
