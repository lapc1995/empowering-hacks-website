function EmpoweringHacksUploader() {}

EmpoweringHacksUploader.uploadDesignAndHandles = (title, aka, description, family, images, alts, files, sizes, noUploadImages, noUploadAlts, noUploadFiles, noUploadSizes, callback, error) => {
    EmpoweringHacksUploader.uploadDesign(title, aka, description, family, images, alts, noUploadImages, noUploadAlts).then(
        (resolve) => {
            let ref = title.split(' ').join('').toLowerCase();
            console.log("here");
            EmpoweringHacksUploader.uploadHandles(ref, files, sizes, noUploadFiles, noUploadSizes).then(
                (resolve) => { console.log(resolve); callback(resolve) },
                (reject) => { console.log(rekect); error(reject)},
            );
        },
        (reject) => {
            console.log("error");
        }
    );
}

EmpoweringHacksUploader.uploadDesign = (title, aka, description, family, images, alts, noUploadImages, noUploadAlts) => {

    let ref = title.split(' ').join('').toLowerCase();
    let contentFamily = family.split(' ').join('').toLowerCase();

    let contentImages = '';

    let imagePromises = [];

    let i = 0;

    for(i; i < noUploadImages.length; i++) {
        contentImages += `
    - image:
        url: "${noUploadImages[i]}"
        alt: "${noUploadAlts[i]}"`
    }

    for(i; i < images.length; i++) {

        let fileSplit = images[i].name.split(".");
        let fileExtention = fileSplit[fileSplit.length-1];

        contentImages += `
    - image:
        url: "/assets/images/designs/${ref}/${i}.${fileExtention}"
        alt: "${alts[i]}"`

        imagePromises.push(EmpoweringHacksUploader.uploadImage(ref, i, fileExtention, images[i]));
    }

    let content = `---
layout: design
name: ${ref}
title: "${title}"
aka: ${aka}
description: "${description}"
images:${contentImages}
family: ${contentFamily} 
---`;

    GitHubHelper.writeFile(content, `_designs/${ref}.md`, `${ref} Design Added`, true);

    let contentupdate = `---
layout: updatecontent
name: "${ref}"
---`;

    GitHubHelper.writeFile(contentupdate, `_designs_update/${ref}.md`, `${ref} Design Added`, true);


    return Promise.all(imagePromises);
}

EmpoweringHacksUploader.uploadImage = (ref, filename, extension, image) => {

    return new Promise( (resolve, reject) => {

        let reader = new FileReader();
   
        reader.onload = (event) => {
            let content = reader.result.replace(/^(.+,)/, '');
            GitHubHelper.writeFile(content, `assets/images/designs/${ref}/${filename}.${extension}`, `Added image ${filename} to design ${ref}`, false);
            resolve({ref, filename, extension, image});
        }
    
        reader.onerror = (event) => {
            reject({ref, filename, extension, image});
        }
    
        reader.readAsDataURL(image);

    });

}

EmpoweringHacksUploader.uploadHandleTest = () => {

    let file = document.getElementById("filesForUpload").files[0];

    let fileSplit = file.name.split(".");
    let fileExtention = fileSplit[fileSplit.length-1];
    
    EmpoweringHacksUploader.uploadHandle("golfball", "5.5mm", fileExtention, file);

}

EmpoweringHacksUploader.uploadHandleFile = (ref, size, extension, file) => {

    return new Promise( (resolve, reject) => {

        let reader = new FileReader();

        reader.onload = (event) => {
            GitHubHelper.writeFile( reader.result, `assets/files/${ref}${size}/${ref}${size}.${extension}`, `Added handle file ${ref}${size}.${extension} to design ${ref}`, true);
            resolve({ref, size, extension, file});
        }
    
        reader.onerror = (event) => {
            reject({ref, size, extension, file});
        }
    
        reader.readAsText(file);

    });
}

EmpoweringHacksUploader.uploadHandle = (title, size, files) => {

    console.log(title);
    console.log(size);
    console.log(files);

    let design = title.split(' ').join('').toLowerCase();
    let contentFiles = '';

    let filePromises = [];

    for(let i = 0; i < files.length; i++) {

        if(files[i].upload == true) {
            let fileSplit = files[i].file.name.split(".");
            let fileExtension = fileSplit[fileSplit.length-1];

            contentFiles += `
    - file:
        url: "assets/files/${design}${size}/${design}${size}.${fileExtension}"
        type: "${fileExtension}"`

            filePromises.push(EmpoweringHacksUploader.uploadHandleFile(design, size, fileExtension, files[i].file));

        } else {
            let fileSplit = files[i].file.split(".");
            let fileExtension = fileSplit[fileSplit.length-1];

            contentFiles += `
    - file:
        url: "${files[i].file}"
        type: "${fileExtension}"`

        }
    }

    let content = `---
ref: ${design}${size}
design: ${design}
size: ${size}
images:
description:
files: ${contentFiles}
---`;

    GitHubHelper.writeFile(content, `_handles/${design}${size}.md`, `${design}${size} Handle Added`, true);

    console.log("here3");

    return Promise.all(filePromises);

}

EmpoweringHacksUploader.uploadHandles = (design, files, sizes, noUploadFiles, noUploadSizes) => {

    if(files.length != sizes.length)
        return -1;

    let filesBySizes = [];

    for(let i = 0; i < noUploadFiles.length; i++) {
        let fileSize = filesBySizes.find(element => element.size === noUploadSizes[i]);
        if(fileSize != undefined)
            fileSize.files.push({file: noUploadFiles[i], upload: false});
        else
            filesBySizes.push({size: sizes[i], files: [{file: noUploadFiles[i], upload: false}]});
    }
    
    for(let i = 0; i < files.length; i++) {
        let fileSize = filesBySizes.find(element => element.size === sizes[i]);
        if(fileSize != undefined)
            fileSize.files.push({file: files[i], upload: true});
        else
            filesBySizes.push({size: sizes[i], files: [{file: files[i], upload: true}]});
    }

    let handlePromises = [];
    filesBySizes.forEach(element => handlePromises.push(EmpoweringHacksUploader.uploadHandle(design, element.size, element.files)));

    console.log("here2");
    console.log(filesBySizes);

    return Promise.all(handlePromises);

}

EmpoweringHacksUploader.deleteFiles = (files) =>  {
    console.log(files);
    for(let i = 0; i < files.length; i++) {
        console.log(files[i]);
        console.log(files[i].url)
        GitHubHelper.deleteFile(files[i].url, `File Deleted - ${files.url}`);
    }
    /*I
    files.forEach( file => {
        GitHubHelper.deleteFile(file.url);
    });
    */

}
