import { FabricObject } from 'fabric';

FabricObject.customProperties = ['letterhead'];

// Fabric 7 defaults to center/center; design tools (Polotno, CE.SDK) use top-left frames.
Object.assign(FabricObject.ownDefaults, {
  originX: 'left',
  originY: 'top',
});
