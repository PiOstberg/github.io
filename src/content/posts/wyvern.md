---
title: 'Wyvern'
date: 2024-06-14T00:00:00+01:00
image: 'wyvern.png'
draft: false
summary: 'Cross-Platform C++ Game Engine'
tags: ['C++', 'Engine']
params:
    description: 'One Engine, Some Platforms'
---

<style>
table, th, td {
  border:1px dotted #F3F5F6;
  border-collapse: collapse;
}
th, td {
  padding: 4px;
}
</style>

Wyvern is a 3D game engine developed from scratch by me.  
Its main goal is for me to learn about how engines function, but also to act as my main game engine because of my disappointment in already existing ones, such as Unity or Unreal Engine.

[Demo of a slightly older version of Wyvern](https://argore.itch.io/wyvern-demo?password=psq)

The source can be found on [the github repository](https://github.com/argoreofficial/wyvern). NDA bound platform-specific code is kept on a private server.  
This page will only outline some core features and explanations for certain design decisions.

Libraries and frameworks Wyvern uses:

| Library                                               | Use             | Platforms | 
|-------------------------------------------------------|-----------------|-----------|
| [GLFW](https://www.glfw.org)                          | Window Handling | Windows   |
| [SDL](https://www.libsdl.org)                         | Window Handling | All       |
| [GLM](https://github.com/g-truc/glm)                  | Matrix Maths    | All       |
| [Assimp](https://github.com/assimp/assimp)            | Model Parsing   | All       |
| [stb_image](https://github.com/nothings/stb)          | Image Parsing   | All       |
| [ImGUI](https://github.com/ocornut/imgui)             | Debug UI        | All       |
| [JoltPhysics](https://github.com/jrouwe/JoltPhysics/) | Physics         | Windows   |
| [MiniAudio](https://miniaud.io)                       | Audio           | All       |
| [nlohmann::json](https://github.com/nlohmann/json)    | json parsing    | All       | 

## XMake Build Tool
The first thing to talk about is the build tool. Wyvern uses [XMake](https://xmake.io/), an open source Lua based build tool.  
It's my favourite build tool for a number of reasons, most notably because of how easy to use and set up it is.

## Platforms
The aim is to support Windows, Linux, Android, and some consoles (Nintendo 3DS, PlayStation, etc.). Currently it's only been tested on Windows and WASM.

Using XMake I built up a relatively straight forward platforming-system that allows me to easily add more platforms and pick what it supports.
Eg. Windows supports both GLFW and SDL, while WASM only supports SDL.

## The Engine
Wyvern uses a configuration setup, where the developer implements the `wv::iApplication` interface. This is used to set up and configure the engine and it's subsystems, as well as inform the reflection system about any custom classes they may have implemented. Ownership of everything is then passed to the engine.

A typical application implementation looks something like this;

### MyApplication.h
<details>
<summary>Click to expand</summary>

```cpp
#pragma once

#include <wv/Engine/Application.h>

class cMyApplication : public wv::iApplication
{
public:
	cMyApplication() { }

	// Inherited via iApplication
	bool create ( void ) override;
	void run    ( void ) override;
	void destroy( void ) override;
};

```
</details>

### MyApplication.cpp
<details>
<summary>Click to expand</summary>

```cpp
bool cMyApplication::create( void )
{
	wv::EngineDesc engineDesc;
	engineDesc.windowWidth  = 1280;
	engineDesc.windowHeight = 960;
	engineDesc.showDebugConsole = true;

	// create device context
	wv::ContextDesc ctxDesc;
	ctxDesc.deviceApi   = wv::WV_DEVICE_CONTEXT_API_GLFW;
	ctxDesc.graphicsApi = wv::WV_GRAPHICS_API_OPENGL;
	ctxDesc.graphicsApiVersion.major = 3;
	ctxDesc.graphicsApiVersion.minor = 1;
	
    ctxDesc.name   = "Wyvern Sandbox";
	ctxDesc.width  = engineDesc.windowWidth;
	ctxDesc.height = engineDesc.windowHeight;

	ctxDesc.allowResize = false;

	wv::iDeviceContext* deviceContext = wv::iDeviceContext::getDeviceContext( &ctxDesc );
	deviceContext->setSwapInterval( 0 ); // disable vsync
	
	// create graphics device
	wv::GraphicsDeviceDesc deviceDesc;
	deviceDesc.loadProc = deviceContext->getLoadProc();
	deviceDesc.pContext = deviceContext;
	
	wv::iGraphicsDevice* graphicsDevice = wv::iGraphicsDevice::createGraphicsDevice( &deviceDesc );

	engineDesc.device.pContext  = deviceContext;
	engineDesc.device.pGraphics = graphicsDevice;
	engineDesc.device.pAudio    = new wv::AudioDevice( nullptr );
	
	// set up modules
    wv::cFileSystem* fileSystem = new wv::cFileSystem();
	fileSystem->addDirectory( L"res/" );
	fileSystem->addDirectory( L"res/materials/" );
	fileSystem->addDirectory( L"res/meshes/" );
	fileSystem->addDirectory( L"res/shaders/" );
	fileSystem->addDirectory( L"res/textures/" );

	engineDesc.systems.pFileSystem = fileSystem;
	engineDesc.systems.pShaderRegistry = new wv::cShaderRegistry( engineDesc.systems.pFileSystem, graphicsDevice );
	
	// setup application state and scenes
	wv::cApplicationState* appState = new wv::cApplicationState();
	engineDesc.pApplicationState = appState;

	wv::cSceneRoot* scene = appState->loadScene( fileSystem, "res/scenes/defaultScene.json" );
	appState->addScene( scene );

	// create engine
	m_pEngine = new wv::cEngine( &engineDesc );

    return true;
}
```
</details>

## Physics

Wyvern uses the Jolt Physics Engine for real-time rigidbody physics.  
Stress testing showed that it could handle about 6600 sphere bodies before going under 60 FPS. This is partly due to the not-optimal rendering however.

![](/images/wyvern/physicsballs.png)

## Reflection

To allow for runtime scene object creation I developed a simple reflection system that takes advantage of static template variables.  
It's something I did earlier in my Reflection project with functions, but with classes.

Reflecting a class is as simple as using the `REFLECT_CLASS()` helper macro, and implementing the static `createInstance` and `createInstanceJson` functions.
The macro expands into one line of code for you macro haters out there.

Something that I might change is the functions, as they're currently required.  
I would much rather have virtual functions that you override. That way you don't have to include `createInstanceJson` on classes that don't need it.

A basic reflected class:
```cpp
#pragma once
#include <wv/Reflection/Reflection.h>

class cPrinter
{
public:
    cPrinter()
    {
        printf( "a cPrinter was created\n" );
    }

    static cPrinter* createInstance    ( void )                  { return new cPrinter(); }
    static cPrinter* createInstanceJson( nlohmann::json& _json ) { return new cPrinter(); }
}

REFLECT_CLASS( cPrinter );
// expands to 
// wv::ClassReflect<cPrinter> wv::ClassReflector<cPrinter>::creator{ "cPrinter" };
```
It also works on templated classes, although each template has to be reflected individually
```cpp
REFLECT_CLASS( cPrinter<int>   );
REFLECT_CLASS( cPrinter<float> );
REFLECT_CLASS( cPrinter<bool>  );
```
Creating an instance of a reflected class would then be done through the `cReflectionRegistry` class
```cpp
iSomeBaseClass* classObject1 = wv::cReflectionRegistry::createClassInstance( "cDerivedClass1" );
iSomeBaseClass* classObject2 = wv::cReflectionRegistry::createClassInstance( "cDerivedClass2" );
iSomeBaseClass* classObject3 = wv::cReflectionRegistry::createClassInstance( "cDerivedTemplate<bool>" );
iSomeBaseClass* classObject4 = wv::cReflectionRegistry::createClassInstance( "cDerivedTemplate<char>" );
```
