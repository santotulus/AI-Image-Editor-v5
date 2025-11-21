
import { GoogleGenAI, Modality } from "@google/genai";

// --- SHARED UTILITIES & HELPER FUNCTIONS ---

// DOM Elements for Navigation
const mobileMenuButton = document.getElementById('mobile-menu-button') as HTMLButtonElement;
const sidebar = document.getElementById('sidebar') as HTMLElement;

// Sidebar Toggle
if (mobileMenuButton && sidebar) {
    mobileMenuButton.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
    });
}

// Page Navigation
const pages = {
    product: document.getElementById('product-generator-page'),
    model: document.getElementById('model-generator-page'),
    pasPhoto: document.getElementById('pas-photo-generator-page'),
    travel: document.getElementById('travel-generator-page'),
    prewedding: document.getElementById('prewedding-generator-page'),
    restoration: document.getElementById('digital-restoration-page')
};

const navBtns = {
    product: document.getElementById('nav-product-btn'),
    model: document.getElementById('nav-model-btn'),
    pasPhoto: document.getElementById('nav-pas-photo-btn'),
    travel: document.getElementById('nav-travel-btn'),
    prewedding: document.getElementById('nav-prewedding-btn'),
    restoration: document.getElementById('nav-restoration-btn')
};

function setActiveNav(activeBtnId: string) {
    Object.values(navBtns).forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-indigo-600', 'text-white');
            btn.classList.add('hover:bg-slate-800');
        }
    });
    const activeBtn = navBtns[activeBtnId as keyof typeof navBtns];
    if (activeBtn) {
        activeBtn.classList.add('bg-indigo-600', 'text-white');
        activeBtn.classList.remove('hover:bg-slate-800');
    }
}

function showPage(pageId: string) {
    Object.values(pages).forEach(page => {
        if (page) page.classList.add('hidden');
    });
    const pageToShow = pages[pageId as keyof typeof pages];
    if (pageToShow) pageToShow.classList.remove('hidden');
}

// Attach Navigation Listeners
Object.keys(navBtns).forEach(key => {
    const btn = navBtns[key as keyof typeof navBtns];
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(key);
            setActiveNav(key);
        });
    }
});

// Image Preview Modal
const imagePreviewModal = document.getElementById('image-preview-modal') as HTMLElement;
const modalImage = document.getElementById('modal-image') as HTMLImageElement;
const closeModalBtn = document.getElementById('close-modal-btn') as HTMLButtonElement;

function showImagePreview(imageUrl: string) {
    if (modalImage) modalImage.src = imageUrl;
    if (imagePreviewModal) imagePreviewModal.classList.remove('hidden');
}

function hideImagePreview() {
    if (imagePreviewModal) imagePreviewModal.classList.add('hidden');
    if (modalImage) modalImage.src = '';
}

if (closeModalBtn) closeModalBtn.addEventListener('click', hideImagePreview);
if (imagePreviewModal) {
    imagePreviewModal.addEventListener('click', (e) => {
        if (e.target === imagePreviewModal) hideImagePreview();
    });
}

// Modal Alert
function showModal(message: string) {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center animate-fade-in';
    const modalText = document.createElement('p');
    modalText.className = 'text-slate-700 mb-4';
    modalText.textContent = message;
    const closeButton = document.createElement('button');
    closeButton.className = 'bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200';
    closeButton.textContent = 'OK';
    closeButton.onclick = () => document.body.removeChild(modalBackdrop);
    
    modalContent.appendChild(modalText);
    modalContent.appendChild(closeButton);
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
}

// File Uploader Setup
function setupFileUploader(inputId: string, previewId: string, promptId: string, callback: (base64: string, fileType: string) => void) {
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    const previewEl = document.getElementById(previewId) as HTMLImageElement;
                    if (previewEl) {
                        previewEl.src = result;
                        previewEl.classList.remove('hidden');
                    }
                    const promptEl = document.getElementById(promptId);
                    if (promptEl) promptEl.classList.add('hidden');
                    
                    const base64 = result.split(',')[1];
                    callback(base64, file.type);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Generic Result Card Creator
function createImageResultCard(imageUrl: string, downloadPrefix: string, aspectClass: string = 'aspect-square', objectFit: string = 'object-contain') {
    const container = document.createElement('div');
    container.className = `relative group bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden ${aspectClass}`;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = "Generated Image";
    img.className = `w-full h-full ${objectFit} rounded-lg animate-fade-in`;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity';

    const createBtn = (svgPath: string, onClick: () => void) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">${svgPath}</svg>`;
        btn.onclick = onClick;
        return btn;
    };

    const previewBtn = createBtn(
        '<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>',
        () => showImagePreview(imageUrl)
    );

    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `${downloadPrefix}_${Date.now()}.png`;
    downloadLink.className = 'p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 cursor-pointer';
    downloadLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>`;

    buttonContainer.appendChild(previewBtn);
    buttonContainer.appendChild(downloadLink);
    container.appendChild(img);
    container.appendChild(buttonContainer);

    return container;
}

// Generic Grid Renderer
function renderResultsGrid(
    gridId: string, 
    placeholderId: string, 
    downloadBtnId: string | null, 
    images: string[], 
    prefix: string, 
    aspectClass: string = 'aspect-square',
    objectFit: string = 'object-contain'
) {
    const grid = document.getElementById(gridId);
    const placeholder = document.getElementById(placeholderId);
    const downloadBtn = downloadBtnId ? document.getElementById(downloadBtnId) : null;

    if (!grid) return;

    grid.innerHTML = '';
    
    if (images.length > 0) {
        if (placeholder) placeholder.classList.add('hidden');
        grid.classList.remove('hidden');

        if (downloadBtn) {
            downloadBtn.classList.remove('hidden');
            downloadBtn.onclick = () => downloadAllImages(images, prefix);
        }

        images.forEach(url => {
            const card = createImageResultCard(url, prefix, aspectClass, objectFit);
            grid.appendChild(card);
        });
    } else {
        if (placeholder) placeholder.classList.remove('hidden');
        grid.classList.add('hidden');
        if (downloadBtn) downloadBtn.classList.add('hidden');
    }
}

// API & Utility Functions
async function generateImage(parts: any[], aspectRatio: string = "1:1") {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let attempt = 0;
    const maxAttempts = 3; // Reduced attempts for speed
    let delay = 1000;

    // Map UI aspect ratios to Gemini supported aspect ratios (if directly supported)
    // For flash-image, standard is 1:1, but we can guide via prompt or post-process.
    // However, `config.imageConfig` exists for some models. 
    // Since we are using gemini-2.5-flash-image, specific aspect ratio config might be limited or prompt based.
    // We will pass it in config if supported, otherwise rely on prompt guidance if needed.
    // NOTE: gemini-2.5-flash-image supports 1:1, 3:4, 4:3, 9:16, 16:9 via config.

    while (attempt < maxAttempts) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: parts },
                config: { 
                    responseModalities: [Modality.IMAGE],
                    // @ts-ignore - aspect ratio is supported in newer SDK versions/models
                    imageConfig: { aspectRatio: aspectRatio }
                },
            });

            if (!response.candidates || response.candidates.length === 0) {
                throw new Error("API response was empty.");
            }

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            throw new Error("No image data found.");
        } catch (error: any) {
            console.error(error);
            attempt++;
            if (attempt >= maxAttempts) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 1.5;
        }
    }
    throw new Error("Failed after multiple attempts.");
}

async function downloadAllImages(imageUrls: string[], prefix: string) {
    for (let i = 0; i < imageUrls.length; i++) {
        const link = document.createElement('a');
        link.href = imageUrls[i];
        link.download = `${prefix}_${i + 1}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

function toggleLoadingState(
    isLoading: boolean,
    elements: { 
        btn: HTMLElement, 
        loader: HTMLElement, 
        placeholder: HTMLElement, 
        grid: HTMLElement, 
        errorMsg: HTMLElement,
        downloadBtn?: HTMLElement
    },
    loadingText?: string
) {
    if (elements.btn) (elements.btn as HTMLButtonElement).disabled = isLoading;
    
    // Handle Button Spinner if exists (Product/Model style)
    const btnSpinner = elements.btn.querySelector('.spinner');
    const btnText = elements.btn.querySelector('#btn-text') || elements.btn.querySelector('span');
    
    if(btnSpinner) {
        (btnSpinner as HTMLElement).style.display = isLoading ? 'inline-block' : 'none';
    }
    // Only toggle text if it's wrapped in a span or id
    if(btnText && btnText.id !== 'btn-spinner') {
         (btnText as HTMLElement).style.display = isLoading ? 'none' : 'inline';
    } else if (elements.btn.innerText && !btnText) {
        // Fallback for buttons without span structure (like simple text buttons)
        // (skipped for now to avoid breaking layout, reliance on spinner is enough)
    }

    if (elements.loader) {
        elements.loader.classList.toggle('hidden', !isLoading);
        if(loadingText) {
            const p = elements.loader.querySelector('p');
            if(p) p.textContent = loadingText;
        }
    }

    if (isLoading) {
        if (elements.placeholder) elements.placeholder.classList.add('hidden');
        if (elements.errorMsg) elements.errorMsg.classList.add('hidden');
        if (elements.grid) elements.grid.classList.add('hidden');
        if (elements.downloadBtn) elements.downloadBtn.classList.add('hidden');
    }
}

function showError(message: string, elements: { placeholder: HTMLElement, loader: HTMLElement, grid: HTMLElement, errorMsg: HTMLElement, errorDetails: HTMLElement }) {
    if (elements.placeholder) elements.placeholder.classList.add('hidden');
    if (elements.loader) elements.loader.classList.add('hidden');
    if (elements.errorMsg) elements.errorMsg.classList.remove('hidden');
    if (elements.errorDetails) elements.errorDetails.textContent = message;
    // Keep grid visible if it has content
    if (elements.grid && elements.grid.children.length === 0) {
        elements.grid.classList.add('hidden');
    } else if (elements.grid) {
         elements.grid.classList.remove('hidden');
    }
}


// --- PRODUCT GENERATOR ---
const productForm = document.getElementById('generation-form') as HTMLFormElement;
if (productForm) {
    const elements = {
        btn: document.getElementById('generate-btn')!,
        loader: document.getElementById('results-loader')!,
        placeholder: document.getElementById('results-placeholder')!,
        grid: document.getElementById('results-grid')!,
        errorMsg: document.getElementById('error-message')!,
        errorDetails: document.getElementById('error-details')!,
        downloadBtn: document.getElementById('product-download-all-btn')!
    };
    
    let productBase64: string | null = null;
    let productMimeType = "image/png";
    let modelBase64: string | null = null;
    let modelMimeType = "image/jpeg";

    setupFileUploader('product-upload', 'image-preview', 'upload-prompt', (b64, type) => { productBase64 = b64; productMimeType = type; });
    setupFileUploader('model-upload', 'model-image-preview', 'model-upload-prompt', (b64, type) => { modelBase64 = b64; modelMimeType = type; });

    // UI Toggles
    const toggles = [
        'custom-prompt-checkbox', 'upload-type', 'without-model', 
        'generate-model-radio', 'upload-model-radio', 'interaction-type', 'age-range'
    ];
    const updateView = () => {
        const useCustom = (document.getElementById('custom-prompt-checkbox') as HTMLInputElement).checked;
        (document.getElementById('guided-options') as HTMLFieldSetElement).disabled = useCustom;
        (document.getElementById('custom-prompt-container') as HTMLElement).style.display = useCustom ? 'block' : 'none';
        if(useCustom) return;

        const isNoModel = (document.getElementById('without-model') as HTMLInputElement).checked;
        const modelSource = (document.querySelector('input[name="model-source"]:checked') as HTMLInputElement)?.value;
        const uploadType = (document.getElementById('upload-type') as HTMLSelectElement).value;

        (document.getElementById('product-name-container') as HTMLElement).style.display = uploadType === 'fabric' ? 'block' : 'none';
        (document.getElementById('lighting-container') as HTMLElement).style.display = isNoModel ? 'block' : 'none';
        (document.getElementById('shared-model-options') as HTMLElement).style.display = isNoModel ? 'none' : 'block';
        (document.getElementById('model-source-container') as HTMLElement).style.display = isNoModel ? 'none' : 'flex';
        (document.getElementById('upload-model-section') as HTMLElement).style.display = (!isNoModel && modelSource === 'upload') ? 'block' : 'none';
        (document.getElementById('model-options-generate') as HTMLElement).style.display = (!isNoModel && modelSource === 'generate') ? 'block' : 'none';
        
        const interact = (document.getElementById('interaction-type') as HTMLSelectElement).value;
        (document.getElementById('custom-interaction-container') as HTMLElement).style.display = (interact === 'custom' && !isNoModel) ? 'block' : 'none';
        
        const age = (document.getElementById('age-range') as HTMLSelectElement).value;
        (document.getElementById('custom-age-container') as HTMLElement).style.display = (age === 'custom' && !isNoModel && modelSource === 'generate') ? 'block' : 'none';
    };
    toggles.forEach(id => document.getElementById(id)?.addEventListener('change', updateView));
    updateView();

    // Main Generation Logic
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!productBase64) return showModal('Harap unggah gambar produk.');

        toggleLoadingState(true, elements, "Menghasilkan gambar... ini mungkin memakan waktu.");
        const generatedImages: string[] = [];

        try {
            const imageCount = parseInt((document.getElementById('image-count') as HTMLSelectElement).value, 10);
            // For Product, we stick to 1:1 for now as standard square product shots
            const aspectRatio = "1:1"; 

            for (let i = 0; i < imageCount; i++) {
                let parts: any[] = [];
                const customPrompt = (document.getElementById('custom-prompt-input') as HTMLTextAreaElement).value;
                
                if ((document.getElementById('custom-prompt-checkbox') as HTMLInputElement).checked) {
                    if(!customPrompt) throw new Error('Isi prompt kustom.');
                    parts = [{ text: customPrompt }, { inlineData: { mimeType: productMimeType, data: productBase64 } }];
                    if (modelBase64 && (document.querySelector('input[name="model-source"]:checked') as HTMLInputElement).value === 'upload') {
                        parts.splice(1, 0, { inlineData: { mimeType: modelMimeType, data: modelBase64 } });
                    }
                } else {
                    const productName = (document.getElementById('product-name') as HTMLInputElement).value || 'product';
                    const desc = (document.getElementById('product-description') as HTMLInputElement).value;
                    const noModel = (document.getElementById('without-model') as HTMLInputElement).checked;
                    
                    const studioVariations = [
                        "flat lay on wooden background", "still life with elegant props", "on marble surface",
                        "minimalist composition", "vibrant dynamic shot", "rustic scene", "dark moody luxury",
                        "clean flat lay on color", "floating in white void", "on reflective black surface"
                    ];
                    const variation = studioVariations[i % studioVariations.length];
                    const preservation = " HIGHEST PRIORITY: Preserve all text/logos exactly.";

                    if (noModel) {
                        const prompt = `Professional product photography of ${productName} ${desc}. Scene: ${variation}. ${preservation}`;
                        parts = [{ text: prompt }, { inlineData: { mimeType: productMimeType, data: productBase64 } }];
                    } else {
                        const modelSource = (document.querySelector('input[name="model-source"]:checked') as HTMLInputElement).value;
                        const style = (document.getElementById('photo-style') as HTMLSelectElement).value;
                        const clothing = (document.getElementById('clothing-attributes') as HTMLSelectElement).value;
                        const pose = (document.getElementById('model-pose') as HTMLSelectElement).value;
                        const prompt = `Professional photo of a model with ${productName} ${desc}. Style: ${style}. Pose: ${pose}. Clothing: ${clothing}. ${preservation}`;
                        
                        if (modelSource === 'upload' && modelBase64) {
                            parts = [{ text: prompt }, { inlineData: { mimeType: modelMimeType, data: modelBase64 } }, { inlineData: { mimeType: productMimeType, data: productBase64 } }];
                        } else {
                            const gender = (document.getElementById('gender') as HTMLSelectElement).value;
                            const ethnicity = (document.getElementById('ethnicity') as HTMLSelectElement).value;
                            const age = (document.getElementById('age-range') as HTMLSelectElement).value;
                            parts = [{ text: `${prompt} Model: ${gender}, ${ethnicity}, ${age}.` }, { inlineData: { mimeType: productMimeType, data: productBase64 } }];
                        }
                    }
                }

                const result = await generateImage(parts, aspectRatio);
                if (result) generatedImages.push(result);
            }
            renderResultsGrid('results-grid', 'results-placeholder', 'product-download-all-btn', generatedImages, 'product_showcase', 'aspect-square');
        } catch (err: any) {
            showError(err.message, elements);
            if(generatedImages.length > 0) renderResultsGrid('results-grid', 'results-placeholder', 'product-download-all-btn', generatedImages, 'product_showcase', 'aspect-square');
        } finally {
            toggleLoadingState(false, elements);
        }
    });
}

// --- MODEL GENERATOR ---
const modelForm = document.getElementById('model-generation-form') as HTMLFormElement;
if (modelForm) {
    let modelBase64: string | null = null;
    let modelMimeType = "image/jpeg";
    setupFileUploader('model-page-upload-input', 'model-page-image-preview', 'model-page-upload-prompt', (b64, type) => { modelBase64 = b64; modelMimeType = type; });

    // SPLIT CLOTHING DICTIONARY BY GENDER FOR ACCURACY
    const clothingVariations: { [key: string]: { male: string[], female: string[], general: string[] } } = {
        "wearing modern casual clothing": {
            male: ["wearing a white t-shirt and blue jeans", "wearing a denim jacket and black chinos", "wearing a striped polo shirt and khaki pants", "wearing a casual button-down shirt and shorts", "wearing a leather jacket and grey jeans"],
            female: ["wearing a white t-shirt and blue jeans", "wearing a beige oversized hoodie and leggings", "wearing a casual floral blouse and jeans", "wearing a denim jacket over a sundress", "wearing a cute crop top and high-waisted pants"],
            general: ["wearing modern casual clothing"]
        },
        "wearing a Baju Muslim (Muslim attire)": {
            male: ["wearing a white Koko shirt and peci", "wearing a modern batik koko shirt", "wearing a long robe (Jubba) in neutral colors", "wearing a stylish kurta shirt and trousers"],
            female: ["wearing a modern beige Gamis with matching Hijab", "wearing a floral pattern modest dress with hijab", "wearing a stylish tunic and loose trousers with hijab", "wearing an abaya with gold embroidery"],
            general: ["wearing modest Muslim attire"]
        },
        "wearing traditional Indonesian attire": {
            male: ["wearing a Batik shirt with traditional Parang pattern", "wearing a Javanese Beskap outfit", "wearing a traditional weaving cloth (Tenun) shirt"],
            female: ["wearing a Kebaya with intricate lace details and Batik skirt", "wearing a traditional weaving cloth (Tenun) outfit", "wearing a modern Kebaya Encim"],
            general: ["wearing traditional Indonesian attire"]
        },
        "wearing formal attire": {
            male: ["wearing a sharp black tuxedo", "wearing a navy blue business suit with tie", "wearing a charcoal grey blazer and dress pants", "wearing a crisp white dress shirt and black tie"],
            female: ["wearing an elegant evening gown", "wearing a professional blazer and trousers", "wearing a cocktail dress", "wearing a chic business suit"],
            general: ["wearing formal attire"]
        },
        "wearing non-formal clothing": {
            male: ["wearing comfortable loungewear", "wearing a simple tank top and cargo pants", "wearing oversized streetwear"],
            female: ["wearing a simple summer dress", "wearing comfortable loungewear", "wearing a tank top and cargo pants"],
            general: ["wearing non-formal clothing"]
        },
        "wearing elegant clothing": {
            male: ["wearing a sophisticated suit in navy blue", "wearing a velvet dinner jacket", "wearing a high-end designer shirt"],
            female: ["wearing a silk blouse and skirt", "wearing a velvet dress", "wearing a designer gown with jewelry"],
            general: ["wearing elegant clothing"]
        }
    };

    modelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!modelBase64) return showModal('Harap unggah foto model.');

        const elements = {
            btn: document.getElementById('model-page-generate-btn')!,
            loader: document.getElementById('model-page-loader')!,
            placeholder: document.getElementById('model-page-placeholder')!,
            grid: document.getElementById('model-page-output-container')!,
            errorMsg: document.getElementById('model-page-error-msg')!,
            errorDetails: document.getElementById('model-page-error-details')!,
            downloadBtn: document.getElementById('model-download-all-btn')!
        };

        toggleLoadingState(true, elements, "Menghasilkan foto model...");
        const generatedImages: string[] = [];

        try {
            const count = parseInt((document.getElementById('model-image-count') as HTMLSelectElement).value, 10);
            const photoType = (document.getElementById('model-photo-type') as HTMLSelectElement).value;
            const pose = (document.getElementById('model-page-pose') as HTMLSelectElement).value;
            const focus = (document.getElementById('model-page-focus') as HTMLSelectElement).value;
            const selectedClothingCategory = (document.getElementById('model-page-clothing') as HTMLSelectElement).value;
            const aspectRatio = (document.getElementById('model-aspect-ratio') as HTMLSelectElement).value;
            const genderSelection = (document.getElementById('model-gender') as HTMLSelectElement).value;

            // Update grid CSS based on aspect ratio
            const aspectMap: {[key:string]: string} = { 
                '1:1': 'aspect-square', 
                '3:4': 'aspect-[3/4]', 
                '9:16': 'aspect-[9/16]', 
                '16:9': 'aspect-[16/9]' 
            };
            const currentAspectClass = aspectMap[aspectRatio] || 'aspect-square';

            // Apply styles to grid container to ensure cards look right
            elements.grid.className = `w-full grid grid-cols-2 sm:grid-cols-3 gap-4 p-4`;

            for (let i = 0; i < count; i++) {
                let specificClothing = "";
                const categoryData = clothingVariations[selectedClothingCategory];

                // GENDER LOGIC
                if (categoryData) {
                    if (genderSelection === 'man') {
                        // Explicitly pick from Male list
                        specificClothing = categoryData.male[Math.floor(Math.random() * categoryData.male.length)];
                    } else if (genderSelection === 'woman') {
                        // Explicitly pick from Female list
                        specificClothing = categoryData.female[Math.floor(Math.random() * categoryData.female.length)];
                    } else {
                        // AUTO: Use a smart prompt construction
                        // We pick one random male item and one random female item to suggest to the AI
                        const randMale = categoryData.male[Math.floor(Math.random() * categoryData.male.length)];
                        const randFemale = categoryData.female[Math.floor(Math.random() * categoryData.female.length)];
                        
                        // Construct a prompt that forces the AI to choose based on visual analysis
                        specificClothing = `Analyze the gender of the person in the image. IF THE PERSON IS MALE, they should be ${randMale}. IF THE PERSON IS FEMALE, they should be ${randFemale}. Ensure the clothing style matches the detected gender perfectly.`;
                    }
                } else {
                    specificClothing = selectedClothingCategory;
                }

                const prompt = `A ${photoType} of the person in the provided image. They should be in a ${pose} pose, ${specificClothing}. The photo must be a ${focus}. The final image should have the exact same facial features as the original image.`;
                
                const parts = [{ text: prompt }, { inlineData: { mimeType: modelMimeType, data: modelBase64 } }];
                const result = await generateImage(parts, aspectRatio);
                if (result) generatedImages.push(result);
            }
            renderResultsGrid('model-page-output-container', 'model-page-placeholder', 'model-download-all-btn', generatedImages, 'model_photo', currentAspectClass, 'object-cover');
        } catch (err: any) {
            console.error(err);
            showError(err.message, elements);
            // Try to render what we have
            const aspectRatio = (document.getElementById('model-aspect-ratio') as HTMLSelectElement).value;
            const aspectMap: {[key:string]: string} = { '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '9:16': 'aspect-[9/16]', '16:9': 'aspect-[16/9]' };
            if(generatedImages.length > 0) renderResultsGrid('model-page-output-container', 'model-page-placeholder', 'model-download-all-btn', generatedImages, 'model_photo', aspectMap[aspectRatio], 'object-cover');
        } finally {
            toggleLoadingState(false, elements);
        }
    });
}

// --- PAS PHOTO GENERATOR ---
const pasPhotoForm = document.getElementById('pas-photo-form') as HTMLFormElement;
if (pasPhotoForm) {
    let pasBase64: string | null = null;
    let pasMimeType = "image/jpeg";
    setupFileUploader('pas-photo-upload-input', 'pas-photo-image-preview', 'pas-photo-upload-prompt', (b64, type) => { pasBase64 = b64; pasMimeType = type; });

    pasPhotoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!pasBase64) return showModal('Harap unggah foto wajah.');
        
        const elements = {
            btn: document.getElementById('pas-photo-generate-btn')!,
            loader: document.getElementById('pas-photo-results-loader')!,
            placeholder: document.getElementById('pas-photo-results-placeholder')!,
            grid: document.getElementById('pas-photo-results-grid')!,
            errorMsg: document.getElementById('pas-photo-error-message')!,
            errorDetails: document.getElementById('pas-photo-error-details')!,
            downloadBtn: document.getElementById('pas-photo-download-all-btn')!
        };

        toggleLoadingState(true, elements, "Memproses foto...");
        const generatedImages: string[] = [];
        const photoSize = (document.getElementById('pas-photo-size') as HTMLSelectElement).value;
        // Map Pas Photo sizes to approximate aspect ratios
        const aspectMap: {[key:string]: string} = { '2x3': 'aspect-[2/3]', '3x4': 'aspect-[3/4]', '4x6': 'aspect-[2/3]' };
        // For API config, we map to closest standard or default to 1:1 if unsure, but prompt handles cropping usually.
        // 2x3 is 2:3. 3:4 is supported. 
        const apiRatioMap: {[key:string]: string} = { '2x3': '3:4', '3x4': '3:4', '4x6': '3:4' }; 

        try {
            const count = parseInt((document.getElementById('pas-photo-image-count') as HTMLSelectElement).value, 10);
            const bgColor = (document.getElementById('pas-photo-bg-color') as HTMLSelectElement).value;
            const attire = (document.getElementById('pas-photo-attire') as HTMLSelectElement).value;
            
            for (let i = 0; i < count; i++) {
                const prompt = `Passport photo. Background color: ${bgColor}. Attire: ${attire}. Size ratio: ${photoSize}. Preserve face 100%.`;
                const parts = [{ text: prompt }, { inlineData: { mimeType: pasMimeType, data: pasBase64 } }];
                const result = await generateImage(parts, apiRatioMap[photoSize] || '3:4');
                if (result) generatedImages.push(result);
            }
            renderResultsGrid('pas-photo-results-grid', 'pas-photo-results-placeholder', 'pas-photo-download-all-btn', generatedImages, 'pas_photo', aspectMap[photoSize] || 'aspect-[3/4]', 'object-cover');
        } catch (err: any) {
            showError(err.message, elements);
             if(generatedImages.length > 0) renderResultsGrid('pas-photo-results-grid', 'pas-photo-results-placeholder', 'pas-photo-download-all-btn', generatedImages, 'pas_photo', aspectMap[photoSize] || 'aspect-[3/4]', 'object-cover');
        } finally {
            toggleLoadingState(false, elements);
        }
    });
}

// --- TRAVEL GENERATOR ---
const travelForm = document.getElementById('travel-photo-form') as HTMLFormElement;
if (travelForm) {
    // Simplified file handling for up to 5 inputs
    const travelFiles: ({base64: string, mimeType: string} | null)[] = [null, null, null, null, null];
    [1, 2, 3, 4, 5].forEach(i => {
        const deleteBtn = document.getElementById(`travel-delete-btn-${i}`) as HTMLButtonElement;
        if(deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                travelFiles[i-1] = null;
                (document.getElementById(`travel-upload-input-${i}`) as HTMLInputElement).value = '';
                (document.getElementById(`travel-image-preview-${i}`) as HTMLImageElement).src = '#';
                (document.getElementById(`travel-image-preview-${i}`) as HTMLImageElement).classList.add('hidden');
                document.getElementById(`travel-upload-prompt-${i}`)?.classList.remove('hidden');
                deleteBtn.classList.add('hidden');
            });
        }
        setupFileUploader(`travel-upload-input-${i}`, `travel-image-preview-${i}`, `travel-upload-prompt-${i}`, (b64, type) => {
            travelFiles[i-1] = { base64: b64, mimeType: type };
            deleteBtn?.classList.remove('hidden');
        });
    });

    travelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const activeFiles = travelFiles.filter(f => f !== null);
        if (activeFiles.length === 0) return showModal('Harap unggah setidaknya satu foto.');

        const elements = {
            btn: document.getElementById('travel-generate-btn')!,
            loader: document.getElementById('travel-results-loader')!,
            placeholder: document.getElementById('travel-results-placeholder')!,
            grid: document.getElementById('travel-results-grid')!,
            errorMsg: document.getElementById('travel-error-message')!,
            errorDetails: document.getElementById('travel-error-details')!,
            downloadBtn: document.getElementById('travel-download-all-btn')!
        };

        toggleLoadingState(true, elements, "Memproses foto...");
        const generatedImages: string[] = [];

        try {
            const count = parseInt((document.getElementById('travel-image-count') as HTMLSelectElement).value, 10);
            const bg = (document.getElementById('travel-bg-select') as HTMLSelectElement).value;
            const season = (document.getElementById('travel-season-select') as HTMLSelectElement).value;
            const aspectRatio = (document.getElementById('travel-aspect-ratio') as HTMLSelectElement).value;

             // Map Aspect Ratio
             const aspectMap: {[key:string]: string} = { '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '9:16': 'aspect-[9/16]', '16:9': 'aspect-[16/9]' };

            for (let i = 0; i < count; i++) {
                const prompt = `Travel photo. Location: ${bg}. Season: ${season}. Integrate ${activeFiles.length} people. Preserve faces 100%.`;
                const parts: any[] = [{ text: prompt }];
                activeFiles.forEach(f => parts.push({ inlineData: { mimeType: f!.mimeType, data: f!.base64 } }));
                
                const result = await generateImage(parts, aspectRatio);
                if (result) generatedImages.push(result);
            }
            renderResultsGrid('travel-results-grid', 'travel-results-placeholder', 'travel-download-all-btn', generatedImages, 'travel_photo', aspectMap[aspectRatio], 'object-cover');
        } catch (err: any) {
            showError(err.message, elements);
            if(generatedImages.length > 0) {
                 const aspectRatio = (document.getElementById('travel-aspect-ratio') as HTMLSelectElement).value;
                 const aspectMap: {[key:string]: string} = { '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '9:16': 'aspect-[9/16]', '16:9': 'aspect-[16/9]' };
                renderResultsGrid('travel-results-grid', 'travel-results-placeholder', 'travel-download-all-btn', generatedImages, 'travel_photo', aspectMap[aspectRatio], 'object-cover');
            }
        } finally {
            toggleLoadingState(false, elements);
        }
    });
}

// --- PREWEDDING GENERATOR ---
const preweddingForm = document.getElementById('prewedding-photo-form') as HTMLFormElement;
if (preweddingForm) {
    let fileA: {base64: string, mimeType: string} | null = null;
    let fileB: {base64: string, mimeType: string} | null = null;
    
    setupFileUploader('prewedding-upload-input-a', 'prewedding-image-preview-a', 'prewedding-upload-prompt-a', (b64, type) => {
        fileA = { base64: b64, mimeType: type };
        document.getElementById('prewedding-delete-btn-a')?.classList.remove('hidden');
    });
    setupFileUploader('prewedding-upload-input-b', 'prewedding-image-preview-b', 'prewedding-upload-prompt-b', (b64, type) => {
        fileB = { base64: b64, mimeType: type };
        document.getElementById('prewedding-delete-btn-b')?.classList.remove('hidden');
    });

    // Handle delete buttons
    ['a', 'b'].forEach(key => {
        document.getElementById(`prewedding-delete-btn-${key}`)?.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if(key === 'a') fileA = null; else fileB = null;
            (document.getElementById(`prewedding-upload-input-${key}`) as HTMLInputElement).value = '';
            const preview = document.getElementById(`prewedding-image-preview-${key}`) as HTMLImageElement;
            preview.src = '#'; preview.classList.add('hidden');
            document.getElementById(`prewedding-upload-prompt-${key}`)?.classList.remove('hidden');
            (e.target as HTMLElement).closest('button')?.classList.add('hidden');
        });
    });

    // Location toggle
    const updateLoc = () => {
        const isOutdoor = (document.getElementById('prewedding-location-type-outdoor') as HTMLInputElement).checked;
        (document.getElementById('prewedding-location-outdoor-container') as HTMLElement).classList.toggle('hidden', !isOutdoor);
        (document.getElementById('prewedding-location-indoor-container') as HTMLElement).classList.toggle('hidden', isOutdoor);
    };
    document.getElementById('prewedding-location-type-outdoor')?.addEventListener('change', updateLoc);
    document.getElementById('prewedding-location-type-indoor')?.addEventListener('change', updateLoc);

    preweddingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!fileA || !fileB) return showModal('Harap unggah kedua foto.');

        const elements = {
            btn: document.getElementById('prewedding-generate-btn')!,
            loader: document.getElementById('prewedding-results-loader')!,
            placeholder: document.getElementById('prewedding-results-placeholder')!,
            grid: document.getElementById('prewedding-results-grid')!,
            errorMsg: document.getElementById('prewedding-error-message')!,
            errorDetails: document.getElementById('prewedding-error-details')!,
            downloadBtn: document.getElementById('prewedding-download-all-btn')!
        };

        toggleLoadingState(true, elements, "Memproses foto...");
        const generatedImages: string[] = [];

        try {
            const count = parseInt((document.getElementById('prewedding-image-count') as HTMLSelectElement).value, 10);
            const isOutdoor = (document.getElementById('prewedding-location-type-outdoor') as HTMLInputElement).checked;
            const loc = (document.getElementById(isOutdoor ? 'prewedding-location-outdoor-select' : 'prewedding-location-indoor-select') as HTMLSelectElement).value;
            const attire = (document.getElementById('prewedding-attire-select') as HTMLSelectElement).value;
            const aspectRatio = (document.getElementById('prewedding-aspect-ratio') as HTMLSelectElement).value;
            const aspectMap: {[key:string]: string} = { '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '9:16': 'aspect-[9/16]', '16:9': 'aspect-[16/9]' };

            for (let i = 0; i < count; i++) {
                const prompt = `Prewedding photo of couple. Location: ${loc}. Attire: ${attire}. Romantic pose. Preserve faces 100%.`;
                const parts = [
                    { text: prompt },
                    { inlineData: { mimeType: fileA!.mimeType, data: fileA!.base64 } },
                    { inlineData: { mimeType: fileB!.mimeType, data: fileB!.base64 } }
                ];
                const result = await generateImage(parts, aspectRatio);
                if (result) generatedImages.push(result);
            }
            renderResultsGrid('prewedding-results-grid', 'prewedding-results-placeholder', 'prewedding-download-all-btn', generatedImages, 'prewedding_photo', aspectMap[aspectRatio], 'object-cover');
        } catch (err: any) {
            showError(err.message, elements);
            if(generatedImages.length > 0) {
                const aspectRatio = (document.getElementById('prewedding-aspect-ratio') as HTMLSelectElement).value;
                const aspectMap: {[key:string]: string} = { '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '9:16': 'aspect-[9/16]', '16:9': 'aspect-[16/9]' };
                renderResultsGrid('prewedding-results-grid', 'prewedding-results-placeholder', 'prewedding-download-all-btn', generatedImages, 'prewedding_photo', aspectMap[aspectRatio], 'object-cover');
            }
        } finally {
            toggleLoadingState(false, elements);
        }
    });
}

// --- RESTORATION ---
const restorationForm = document.getElementById('digital-restoration-form') as HTMLFormElement;
if (restorationForm) {
    let restFile: {base64: string, mimeType: string} | null = null;
    setupFileUploader('restoration-upload-input', 'restoration-image-preview', 'restoration-upload-prompt', (b64, type) => { restFile = {base64: b64, mimeType: type}; });

    restorationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!restFile) return showModal('Harap unggah foto.');

        const elements = {
            btn: document.getElementById('restoration-generate-btn')!,
            loader: document.getElementById('restoration-results-loader')!,
            placeholder: document.getElementById('restoration-results-placeholder')!,
            grid: document.getElementById('restoration-results-grid')!,
            errorMsg: document.getElementById('restoration-error-message')!,
            errorDetails: document.getElementById('restoration-error-details')!,
            downloadBtn: document.getElementById('restoration-download-all-btn')!
        };

        toggleLoadingState(true, elements, "Restorasi foto...");
        
        try {
            const prompt = `Restore this photo. Fix damage, correct colors, sharpen details. Preserve likeness 100%. High quality.`;
            const parts = [{ text: prompt }, { inlineData: { mimeType: restFile.mimeType, data: restFile.base64 } }];
            const result = await generateImage(parts);
            if (result) {
                renderResultsGrid('restoration-results-grid', 'restoration-results-placeholder', 'restoration-download-all-btn', [result], 'restored_photo', 'aspect-auto', 'object-contain');
            } else {
                throw new Error("Gagal.");
            }
        } catch (err: any) {
            showError(err.message, elements);
        } finally {
            toggleLoadingState(false, elements);
        }
    });
}
