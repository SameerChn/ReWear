document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const formMessage = document.getElementById('formMessage');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadingIndicator = document.getElementById('uploadingIndicator');
    formMessage.textContent = '';

    const files = form.images.files;
    if (!files.length) {
        formMessage.textContent = 'Please select at least one image.';
        formMessage.style.color = 'red';
        return;
    }

    // Show uploading indicator and disable button
    uploadingIndicator.style.display = 'block';
    uploadBtn.disabled = true;

    const formData = new FormData();
    formData.append('title', form.title.value);
    formData.append('description', form.description.value);
    formData.append('price', form.price.value);
    for (const file of files) {
        formData.append('images', file);
    }

    try {
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            form.reset();
            formMessage.textContent = 'Product uploaded successfully!';
            formMessage.style.color = 'green';
        } else {
            const data = await response.json();
            formMessage.textContent = data.message || 'Failed to upload product.';
            formMessage.style.color = 'red';
        }
    } catch (err) {
        formMessage.textContent = 'An error occurred. Please try again.';
        formMessage.style.color = 'red';
    } finally {
        uploadingIndicator.style.display = 'none';
        uploadBtn.disabled = false;
    }
}); 