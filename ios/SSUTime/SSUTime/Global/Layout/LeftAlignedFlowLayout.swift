//
//  LeftAlignedFlowLayout.swift
//  SSUTime
//
//  Created by 박현수 on 11/1/25.
//

import UIKit

final class LeftAlignedFlowLayout: UICollectionViewFlowLayout {

    override func layoutAttributesForElements(in rect: CGRect) -> [UICollectionViewLayoutAttributes]? {
        // 기본 FlowLayout의 속성들을 가져옵니다.
        guard let originalAttributes = super.layoutAttributesForElements(in: rect) else {
            return nil
        }
        
        // 원본을 수정하지 않기 위해 복사합니다.
        guard let attributes = NSArray(array: originalAttributes, copyItems: true) as? [UICollectionViewLayoutAttributes] else {
            return nil
        }

        var leftMargin: CGFloat = sectionInset.left
        var currentY: CGFloat = -1.0

        for attribute in attributes {
            // 헤더나 푸터가 아닌 셀에만 적용합니다.
            if attribute.representedElementKind == nil {
                
                // 현재 아이템이 새 줄에 있는지 확인합니다.
                if attribute.frame.origin.y != currentY {
                    // 새 줄이 시작되면, X 위치를 왼쪽 여백(leftMargin)으로 리셋합니다.
                    leftMargin = sectionInset.left
                    currentY = attribute.frame.origin.y
                }
                
                // 아이템의 X 위치를 현재 leftMargin으로 설정합니다.
                attribute.frame.origin.x = leftMargin
                
                // 다음 아이템이 놓일 X 위치를 계산합니다. (현재 아이템 너비 + 최소 간격)
                leftMargin += attribute.frame.width + minimumInteritemSpacing
            }
        }
        
        return attributes
    }
}
