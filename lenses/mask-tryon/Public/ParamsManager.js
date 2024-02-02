//@input Component.Text key1Text;
//@input Asset.Texture robotTexture;
//@input Asset.Texture pumpkinTexture;
//@input Asset.Texture clownTexture;
//@input Component.Image targetImage;

// This will use FallbackData if global.launchParams has not been filled out 
var launchParams = global.launchParams;

/* Storage accessors */
var selectedMask;

var storageKey = "selectedMask"

// Uncomment the declaration below for testing
//launchParams = {
//    "selectedMask" : "robot",
//    "has" : function() {return true},
//    "getString" : function() {return this.selectedMask}
//}

/****************/
function getData() {
    if (launchParams) {
        if (launchParams.has(storageKey) ) {
            
            selectedMask = launchParams.getString(storageKey);         
            return true;
        }
        
    return false;
    }
}

function populateFields() {
    
    var selectedTexture = null;
    switch(selectedMask) {
        case "pumpkin": 
            selectedTexture = script.pumpkinTexture;        
            break;
        case "robot" : 
            selectedTexture = script.robotTexture;            
            break;
        case "clown" : 
            selectedTexture = script.clownTexture;
            break;
    }
    if (selectedTexture == null) {
        script.key1Text.text = "Invalid parameter";
        script.targetImage.enabled = false;
    } else {
        script.targetImage.enabled = true;
        script.targetImage.mainPass.baseTex = selectedTexture;        
    }
}

try {
    if(getData()) { 
        populateFields();
    } else {
        script.key1Text.text = "Failed to get launchParams";
        script.targetImage.enabled = false;
    }    
} catch (ex) {
    script.key1Text.text = "Error " + ex + " " + ex.message;
    script.targetImage.enabled = false;

}
