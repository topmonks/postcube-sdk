(async () => {

    // Generate test key pair
		var keypair = await window.crypto.subtle.generateKey(
    		{
        		name: "ECDH",
        		namedCurve: "P-256", 
    		},
    		true, 
  			["deriveKey", "deriveBits"] 
		)
    
    var privateKey = keypair.privateKey;
    var publicKey = keypair.publicKey;  
    console.log(privateKey)
    console.log(publicKey)
    
    // Export private key as JWK
    var rawPrivateKey = await window.crypto.subtle.exportKey(
    		"jwk",
    		privateKey)
    console.log(rawPrivateKey)

		var rawKeyB64url = rawPrivateKey.d
    var rawKeyB64 = toStdBase64(rawPrivateKey.d)
    console.log(rawKeyB64url)	// Base64url decoded
    console.log(rawKeyB64)		// Base64 decoded

		// ----------------------------------------------------------------------------------

		// Import private key from JWK
    var privateKey = await window.crypto.subtle.importKey(
    		"jwk", 
    		{   
        		crv: "P-256",
        		d: "H9eW3oRyIOVroeWjHgXtgHa7t9G8QwKcP6SCC5HlNYw",
        		ext: true,
        		key_ops: ["deriveKey", "deriveBits"],
        		kty: "EC",
        		x: "t1OHberiQ-CJhnSajRQI0be50oLjJlXgE-Uj-bypuJo",
        		y: "xwN8HMfB-d8UYRYiN3KFRxQvTMUbJ0egCwiWk5_hIro"
    		},
    		{   
        		name: "ECDH",
        		namedCurve: "P-256", 
    		},
        true, 
    		["deriveKey", "deriveBits"] 
		)
    console.log(privateKey)
    
})();

// from https://stackoverflow.com/a/51838635/9014097
function toStdBase64(input) {
		input = input.replace(/-/g, '+').replace(/_/g, '/');
		var pad = input.length % 4;
		if(pad) {
        input += new Array(5-pad).join('=');
    }
    return input;
}

