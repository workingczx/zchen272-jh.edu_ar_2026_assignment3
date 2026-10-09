var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    ground.isVisible = false;

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
    sphere.position.y = 1;
    sphere.position.x = 1;

    var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", { height: 2, diameter: 1 }, scene);
    cylinder.position.y = 1;
    cylinder.position.x = -1;

    BABYLON.Effect.ShadersStore["customVertexShader"] = `
    precision highp float;
    attribute vec3 position;
    attribute vec3 normal;
    uniform mat4 world;
    uniform mat4 worldViewProjection;
    varying vec3 vPosW;
    varying vec3 vNormalW;
    void main() {
        vec4 pw = world * vec4(position, 1.0);
        vPosW = pw.xyz;
        vNormalW = normalize(mat3(world) * normal);
        gl_Position = worldViewProjection * vec4(position, 1.0);
    }`;

    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
    precision highp float;
    varying vec3 vPosW;
    varying vec3 vNormalW;
    uniform float uMatAmbient;
    uniform vec3 uMatDiffuse;
    uniform vec3 uMatSpecular;
    uniform float uMatShininess;
    uniform vec3 uCameraPos;
    uniform vec3 uPointLightColor;
    uniform vec3 uPointLightPos;

    vec3 shadePointLight(vec3 lColor, vec3 lPos, vec3 N, vec3 V, vec3 kd, vec3 ks, float shin) {
        vec3 Lvec = lPos - vPosW;
        float dist = length(Lvec);
        vec3 L = normalize(Lvec);
        float diff = max(dot(N, L), 0.0);
        vec3 diffuse = kd * lColor * diff;
        vec3 R = reflect(-L, N);
        float spec = 0.0;
        if (diff > 0.0) {
            spec = pow(max(dot(R, V), 0.0), shin);
        }
        vec3 specular = ks * lColor * spec;
        float attenuation = 1.0 / (dist * dist);
        return attenuation * (diffuse + specular);
    }

    void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(uCameraPos - vPosW);
        vec3 color = uMatAmbient * uMatDiffuse;
        color += shadePointLight(uPointLightColor, uPointLightPos, N, V, uMatDiffuse, uMatSpecular, uMatShininess);
        gl_FragColor = vec4(color, 1.0);
    }`;

    var shaderMat = new BABYLON.ShaderMaterial("custom", scene, "custom", {
        attributes: ["position", "normal"],
        uniforms: [
            "world", "worldViewProjection",
            "uCameraPos",
            "uMatAmbient", "uMatDiffuse", "uMatSpecular", "uMatShininess",
            "uPointLightColor", "uPointLightPos"
        ]
    });

    // Change experiment to 1, 2, or 3 for the three required screenshots.
    var experiment = 1;

    var ambient = 0.25;
    var diffuse = new BABYLON.Color3(0.8, 0.2, 0.2);
    var specular = new BABYLON.Color3(1.0, 1.0, 1.0);
    var shininess = 32.0;
    var lightColor = new BABYLON.Color3(0.7, 0.8, 1.0);
    var lightPos = new BABYLON.Vector3(2.5, 4.0, -2.0);

    if (experiment === 1) {
        ambient = 0.5;
        diffuse = new BABYLON.Color3(0.2, 0.7, 0.3);
    }
    if (experiment === 2) {
        specular = new BABYLON.Color3(1.0, 0.8, 0.2);
        shininess = 8.0;
    }
    if (experiment === 3) {
        lightColor = new BABYLON.Color3(1.0, 0.4, 0.4);
        lightPos = new BABYLON.Vector3(-3.0, 5.0, -1.0);
    }

    shaderMat.setFloat("uMatAmbient", ambient);
    shaderMat.setColor3("uMatDiffuse", diffuse);
    shaderMat.setColor3("uMatSpecular", specular);
    shaderMat.setFloat("uMatShininess", shininess);
    shaderMat.setColor3("uPointLightColor", lightColor);
    shaderMat.setVector3("uPointLightPos", lightPos);

    scene.onBeforeRenderObservable.add(function () {
        shaderMat.setVector3("uCameraPos", camera.position);
    });

    sphere.material = shaderMat;
    cylinder.material = shaderMat;
    return scene;
};

export default createScene;
