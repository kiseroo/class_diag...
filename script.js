document.addEventListener('DOMContentLoaded', function() {
    // Function to create a relationship line between two elements
    function createRelationship(fromId, toId, type, labelText) {
        const fromElement = document.getElementById(fromId);
        const toElement = document.getElementById(toId);
        
        if (!fromElement || !toElement) {
            console.error(`Elements not found: ${fromId} or ${toId}`);
            return;
        }
        
        // Get positions
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Calculate positions relative to the relationships container
        const relationshipsContainer = document.querySelector('.relationships');
        const containerRect = relationshipsContainer.getBoundingClientRect();
        
        // Calculate connection points based on element positions
        let fromX, fromY, toX, toY;
        
        // Determine the best connection points based on relative positions
        if (fromRect.left + fromRect.width < toRect.left) {
            // From is to the left of To
            fromX = fromRect.right - containerRect.left;
            fromY = fromRect.top + (fromRect.height / 2) - containerRect.top;
            toX = toRect.left - containerRect.left;
            toY = toRect.top + (toRect.height / 2) - containerRect.top;
        } else if (toRect.left + toRect.width < fromRect.left) {
            // To is to the left of From
            fromX = fromRect.left - containerRect.left;
            fromY = fromRect.top + (fromRect.height / 2) - containerRect.top;
            toX = toRect.right - containerRect.left;
            toY = toRect.top + (toRect.height / 2) - containerRect.top;
        } else if (fromRect.top + fromRect.height < toRect.top) {
            // From is above To
            fromX = fromRect.left + (fromRect.width / 2) - containerRect.left;
            fromY = fromRect.bottom - containerRect.top;
            toX = toRect.left + (toRect.width / 2) - containerRect.left;
            toY = toRect.top - containerRect.top;
        } else {
            // To is above From or other cases
            fromX = fromRect.left + (fromRect.width / 2) - containerRect.left;
            fromY = fromRect.top - containerRect.top;
            toX = toRect.left + (toRect.width / 2) - containerRect.left;
            toY = toRect.bottom - containerRect.top;
        }
        
        // Calculate line length and angle
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
        
        // Create relationship line
        const relationship = document.createElement('div');
        relationship.className = `relationship ${type}`;
        relationship.id = `rel-${fromId}-${toId}`;
        relationship.style.width = `${length}px`;
        relationship.style.left = `${fromX}px`;
        relationship.style.top = `${fromY}px`;
        relationship.style.transform = `rotate(${angle}deg)`;
        relationship.style.transformOrigin = '0 0';
        
        // Create label with improved positioning
        const label = document.createElement('div');
        label.className = 'relationship-label';
        label.textContent = labelText;
        
        // Position label to avoid overlapping with lines
        const midX = length / 2;
        label.style.left = `${midX - 40}px`;
        
        // Adjust vertical position based on line angle
        if (angle > 45 && angle < 135) {
            // Line is mostly vertical going down
            label.style.top = '-30px';
        } else if (angle > -135 && angle < -45) {
            // Line is mostly vertical going up
            label.style.top = '10px';
        } else {
            // Line is mostly horizontal
            label.style.top = '-25px';
        }
        
        relationship.appendChild(label);
        relationshipsContainer.appendChild(relationship);
    }
    
    // Clear existing static relationships
    const existingRelationships = document.querySelectorAll('.relationship');
    existingRelationships.forEach(rel => rel.remove());
    
    // Create extends relationships
    createRelationship('share-medical', 'request', 'extends', '«extends»');
    createRelationship('cancel', 'request', 'extends', '«extends»');
    createRelationship('track', 'request', 'extends', '«extends»');
    
    // Create includes relationships
    createRelationship('request', 'payment', 'includes', '«includes»');
    createRelationship('track', 'view-eta', 'includes', '«includes»');
    createRelationship('register', 'login', 'includes', '«includes»');
    
    // Create actor connections dynamically with improved positioning
    function createActorConnections(actorId, useCaseIds) {
        const actor = document.getElementById(actorId);
        if (!actor) return;
        
        const relationshipsContainer = document.querySelector('.relationships');
        const containerRect = relationshipsContainer.getBoundingClientRect();
        const actorRect = actor.getBoundingClientRect();
        
        // Determine if actor is on the left or right side
        const isLeftSide = actor.closest('.left-actors') !== null;
        
        // Set the starting point based on actor position
        let actorX, actorY;
        
        if (isLeftSide) {
            // Left side actors - connection starts from right edge
            actorX = actorRect.right - containerRect.left;
            actorY = actorRect.top + (actorRect.height / 2) - containerRect.top;
        } else {
            // Right side actors - connection starts from left edge
            actorX = actorRect.left - containerRect.left;
            actorY = actorRect.top + (actorRect.height / 2) - containerRect.top;
        }
        
        // Sort use cases by vertical position to reduce crossing lines
        const sortedUseCases = useCaseIds.map(id => {
            const element = document.getElementById(id);
            if (!element) return { id, y: 0 };
            
            const rect = element.getBoundingClientRect();
            return {
                id,
                element,
                rect,
                y: rect.top + (rect.height / 2) - containerRect.top
            };
        }).sort((a, b) => a.y - b.y);
        
        // Create connections with improved positioning
        sortedUseCases.forEach((useCase, index) => {
            if (!useCase.element) return;
            
            // Calculate exact connection points
            let useCaseX, useCaseY;
            let startX = actorX;
            let startY = actorY;
            
            // Add vertical offset to actor connection point to avoid overlapping lines
            const verticalSpread = Math.min(actorRect.height * 0.8, sortedUseCases.length * 4);
            const offset = (index - (sortedUseCases.length - 1) / 2) * (verticalSpread / Math.max(1, sortedUseCases.length - 1));
            startY = actorY + offset;
            
            if (isLeftSide) {
                // For left actors, connect to the left side of use cases
                useCaseX = useCase.rect.left - containerRect.left;
                useCaseY = useCase.rect.top + (useCase.rect.height / 2) - containerRect.top;
            } else {
                // For right actors, connect to the right side of use cases
                useCaseX = useCase.rect.right - containerRect.left;
                useCaseY = useCase.rect.top + (useCase.rect.height / 2) - containerRect.top;
            }
            
            const length = Math.sqrt(Math.pow(useCaseX - startX, 2) + Math.pow(useCaseY - startY, 2));
            const angle = Math.atan2(useCaseY - startY, useCaseX - startX) * (180 / Math.PI);
            
            const connection = document.createElement('div');
            connection.className = 'actor-connection';
            connection.id = `conn-${actorId}-${useCase.id}`;
            connection.style.width = `${length}px`;
            connection.style.left = `${startX}px`;
            connection.style.top = `${startY}px`;
            connection.style.transform = `rotate(${angle}deg)`;
            connection.style.transformOrigin = '0 0';
            
            relationshipsContainer.appendChild(connection);
        });
    }
    
    // Create actor connections
    createActorConnections('patient', ['register', 'login', 'request', 'track', 'share-medical', 'view-eta', 'cancel', 'rate', 'payment', 'history']);
    createActorConnections('emergency-contact', ['request-behalf', 'track-ec', 'notifications']);
    createActorConnections('driver', ['driver-login', 'accept-decline', 'update-availability', 'navigate', 'update-arrival', 'complete-trip']);
    createActorConnections('medical-staff', ['receive-info', 'update-status', 'prepare']);
    createActorConnections('admin', ['manage-accounts', 'monitor', 'reports', 'manage-fleet', 'handle-issues']);
});