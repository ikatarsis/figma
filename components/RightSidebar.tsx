import React from 'react';
import Dimensions from "@/components/settings/Dimensions";
import Color from "@/components/settings/Color";
import Export from "@/components/settings/Export";
import Text from "@/components/settings/Text";
import {RightSidebarProps} from "@/types/type";
import {modifyShape} from "@/lib/shapes";

const RightSidebar = ({
												elementAttributes,
												setElementAttributes,
												fabricRef,
												isEditingRef,
												activeObjectRef,
												syncShapeInStorage,
											}: RightSidebarProps) => {
	const handleInputChange = (property: string, value: string) => {
		if(!isEditingRef.current) isEditingRef.current = true

		setElementAttributes((prev) => ({
			...prev,
			[property]: value,
		}))

		modifyShape({
			canvas: fabricRef.current as fabric.Canvas,
			property,
			value,
			activeObjectRef,
			syncShapeInStorage
		})
	}

	return (
		<section className='flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-2-[227px]
		sticky right-0 h-full max-sm:hidden select-none'>
			<h3 className='px-5 pt-4 text-xs uppercase'>Design</h3>
			<span className='text-xs text-primary-grey-300 mt-3 px-5 border-b border-primary-grey-200 pb-4'>
				Make changes to canvas as you like
			</span>

			<Dimensions
				width={elementAttributes.width}
			  height={elementAttributes.height}
				handleInputChange={handleInputChange}
				isEditingRef={isEditingRef}
			/>
			<Text
				fontFamily={elementAttributes.fontFamily}
				fontSize={elementAttributes.fontSize}
				fontWeight={elementAttributes.fontWeight}
				handleInputChange={handleInputChange}
			/>
			<Color />
			<Export />

		</section>
	);
};

export default RightSidebar;